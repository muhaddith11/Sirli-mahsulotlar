import type { Metadata, Viewport } from "next";
import { Golos_Text } from "next/font/google";
import { getI18n } from "@/i18n/server";
import "./globals.css";

const golos = Golos_Text({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-golos",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.meta.title, template: `%s · ${t.common.shopName}` },
    description: t.meta.description,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale } = await getI18n();
  return (
    <html lang={locale} className={golos.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
