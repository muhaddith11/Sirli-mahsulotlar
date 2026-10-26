import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { effectivePrice } from "@/lib/format";
import { EMPTY_CART, type CartData } from "@/lib/cart-types";

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          nameRu: true,
          slug: true,
          price: true,
          discountPrice: true,
          images: true,
          stock: true,
          volume: true,
          isActive: true,
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

function toCartData(cart: CartWithItems | null): CartData {
  if (!cart) return EMPTY_CART;

  const items = cart.items.map(({ product, quantity }) => {
    const unitPrice = effectivePrice(product);
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      nameRu: product.nameRu,
      image: product.images[0] ?? null,
      volume: product.volume,
      price: product.price,
      discountPrice: product.discountPrice,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
      stock: product.stock,
      available: product.isActive && product.stock >= quantity,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return {
    id: cart.id,
    items,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    discount: subtotal - total,
    total,
    hasUnavailable: items.some((i) => !i.available),
  };
}

export async function getCart(cartId: string | null): Promise<CartData> {
  if (!cartId) return EMPTY_CART;
  const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
  return toCartData(cart);
}

/** Cookie'dagi savat mavjud bo'lsa — uni, bo'lmasa yangisini qaytaradi */
export async function ensureCart(cartId: string | null): Promise<string> {
  if (cartId) {
    const existing = await prisma.cart.findUnique({ where: { id: cartId }, select: { id: true } });
    if (existing) return existing.id;
  }
  const cart = await prisma.cart.create({ data: {}, select: { id: true } });
  return cart.id;
}

async function getSellableProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true, isActive: true },
  });
  if (!product || !product.isActive) throw new AppError("productUnavailable", 404);
  if (product.stock <= 0) throw new AppError("outOfStock", 409, { name: product.name });
  return product;
}

export async function addToCart(cartId: string, productId: string, quantity: number): Promise<CartData> {
  const product = await getSellableProduct(productId);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
    select: { quantity: true },
  });
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > product.stock) throw new AppError("stockLimit", 409, { count: product.stock });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    create: { cartId, productId, quantity },
    update: { quantity: nextQuantity },
  });
  return getCart(cartId);
}

export async function setCartItemQuantity(cartId: string, productId: string, quantity: number): Promise<CartData> {
  if (quantity <= 0) return removeCartItem(cartId, productId);

  const product = await getSellableProduct(productId);
  if (quantity > product.stock) throw new AppError("stockLimit", 409, { count: product.stock });

  const { count } = await prisma.cartItem.updateMany({ where: { cartId, productId }, data: { quantity } });
  if (count === 0) throw new AppError("notInCart", 404);
  return getCart(cartId);
}

export async function removeCartItem(cartId: string, productId: string): Promise<CartData> {
  await prisma.cartItem.deleteMany({ where: { cartId, productId } });
  return getCart(cartId);
}

export async function clearCart(cartId: string): Promise<CartData> {
  await prisma.cartItem.deleteMany({ where: { cartId } });
  return getCart(cartId);
}
