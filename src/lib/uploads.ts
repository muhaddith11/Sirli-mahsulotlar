import "server-only";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { del } from "@vercel/blob";

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

/** Endi ishlatilmaydigan yuklangan fayllarni o'chiradi (Vercel Blob yoki lokal papka). Xatolar jim o'tadi. */
export async function deleteUploads(urls: string[]): Promise<void> {
  const blobs = urls.filter((url) => /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(url));
  const local = urls
    .map((url) => /^\/api\/uploads\/([^/?#]+)$/.exec(url)?.[1])
    .filter((name): name is string => !!name && isSafeUploadName(name));
  if (blobs.length && process.env.BLOB_READ_WRITE_TOKEN) await del(blobs).catch(() => {});
  await Promise.all(local.map((name) => unlink(path.join(getUploadDir(), name)).catch(() => {})));
}
