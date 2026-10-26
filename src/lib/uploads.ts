import "server-only";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(IMAGE_TYPES).map(([type, ext]) => [ext, type]),
);

export function getUploadDir(): string {
  // Runtime papkasi — butun loyihani server bundle'ga trace qilmaslik uchun
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
}

/** Faqat biz yaratgan ko'rinishdagi fayl nomlarini qabul qilamiz (path traversal'dan himoya) */
export function isSafeUploadName(name: string): boolean {
  return /^[a-z0-9-]+\.(jpg|png|webp|avif|gif)$/.test(name);
}

export function contentTypeFor(name: string): string {
  return CONTENT_TYPES[path.extname(name)] ?? "application/octet-stream";
}
