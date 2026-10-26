// Savat ma'lumotlari klient va server o'rtasida shu ko'rinishda uzatiladi.

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  nameRu: string | null;
  image: string | null;
  volume: string | null;
  price: number;
  discountPrice: number | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
  /** Mahsulot sotuvda va kerakli miqdorda bormi */
  available: boolean;
};

export type CartData = {
  id: string | null;
  items: CartLine[];
  totalQuantity: number;
  /** Chegirmasiz summa */
  subtotal: number;
  discount: number;
  total: number;
  hasUnavailable: boolean;
};

export const EMPTY_CART: CartData = {
  id: null,
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
  hasUnavailable: false,
};
