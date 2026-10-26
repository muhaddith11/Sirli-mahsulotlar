import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "src/generated/**", "next-env.d.ts", ".impeccable/**", ".agents/**"],
  },
  {
    rules: {
      // Mahsulot rasmlari ixtiyoriy domendan keladi (Blob, tashqi URL) — oddiy <img> ataylab ishlatiladi
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];

export default config;
