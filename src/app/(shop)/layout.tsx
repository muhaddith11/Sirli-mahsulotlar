import { Toaster } from "sonner";
import { BottomNav } from "@/components/shop/bottom-nav";
import { Footer } from "@/components/shop/footer";
import { Header } from "@/components/shop/header";
import { TelegramBackButton } from "@/components/shop/telegram-back-button";
import { I18nProvider } from "@/i18n/provider";
import { getI18n } from "@/i18n/server";
import { listCategories } from "@/lib/services/products";
import { CartProvider } from "@/providers/cart-provider";
import { TelegramProvider } from "@/providers/telegram-provider";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [{ locale, t }, categories] = await Promise.all([getI18n(), listCategories()]);
  const navCategories = categories.map(({ id, name, nameRu, slug }) => ({ id, name, nameRu, slug }));
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;

  return (
    <I18nProvider locale={locale}>
      <TelegramProvider>
        <CartProvider>
          <TelegramBackButton />
          <Header categories={navCategories} />
          <main className="mx-auto min-h-[60dvh] max-w-7xl px-4 lg:px-6">{children}</main>
          <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
            <Footer
              t={t}
              locale={locale}
              categories={navCategories}
              botUrl={botUsername ? `https://t.me/${botUsername}` : null}
            />
          </div>
          <BottomNav />
          <Toaster
            position="top-center"
            offset={84}
            mobileOffset={{ top: 64 }}
            toastOptions={{
              classNames: {
                toast: "!rounded-[12px] !font-sans !border-line !shadow-[var(--shadow-pop)]",
                actionButton: "!bg-brand !text-white",
              },
            }}
          />
        </CartProvider>
      </TelegramProvider>
    </I18nProvider>
  );
}
