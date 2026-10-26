import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Telegraf faqat serverda ishlaydi — bundlerga qo'shmaymiz
  serverExternalPackages: ["telegraf"],
  // Telegram Mini App'ni ngrok/cloudflared orqali dev rejimda sinash uchun
  allowedDevOrigins: ["*.ngrok-free.app", "*.trycloudflare.com"],
  poweredByHeader: false,
  async headers() {
    // X-Frame-Options qo'yilmaydi: Telegram Web Mini App'ni iframe ichida ochadi
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
};

export default nextConfig;
