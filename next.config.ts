import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Telegraf faqat serverda ishlaydi — bundlerga qo'shmaymiz
  serverExternalPackages: ["telegraf"],
  // Telegram Mini App'ni ngrok/cloudflared orqali dev rejimda sinash uchun
  allowedDevOrigins: ["*.ngrok-free.app", "*.trycloudflare.com"],
};

export default nextConfig;
