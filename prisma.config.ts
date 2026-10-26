import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migratsiyalar pooler orqali emas, to'g'ridan-to'g'ri ulanishda bajariladi
    // (Neon/Vercel buni DATABASE_URL_UNPOOLED sifatida beradi)
    url: process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL"),
  },
});
