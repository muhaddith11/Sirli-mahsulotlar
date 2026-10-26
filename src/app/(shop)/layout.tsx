import { Toaster } from "sonner";
import { BottomNav } from "@/components/shop/bottom-nav";
import { Footer } from "@/components/shop/footer";
import { Header } from "@/components/shop/header";
import { TelegramBackButton } from "@/components/shop/telegram-back-button";
import { CartProvider } from "@/providers/cart-provider";
import { TelegramProvider } from "@/providers/telegram-provider";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <TelegramProvider>
      <CartProvider>
        <TelegramBackButton />
        <Header />
        <main className="mx-auto min-h-[60dvh] max-w-6xl px-4">{children}</main>
        <div className="pb-24 md:pb-0">
          <Footer />
        </div>
        <BottomNav />
        <Toaster
          position="top-center"
          offset={72}
          mobileOffset={{ top: 72 }}
          toastOptions={{ classNames: { toast: "!rounded-2xl !font-sans", actionButton: "!bg-berry-600" } }}
        />
      </CartProvider>
    </TelegramProvider>
  );
}
