import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { getUploadDir, IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/uploads";

/**
 * POST /api/admin/upload — mahsulot rasmini yuklash (multipart, maydon: "file")
 *
 * BLOB_READ_WRITE_TOKEN bo'lsa (Vercel) — rasm Vercel Blob'ga yuklanadi,
 * aks holda UPLOAD_DIR papkasiga saqlanadi va /api/uploads/... orqali beriladi.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return jsonError("Ruxsat yo'q", 401);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("Fayl tanlanmagan");

  const ext = IMAGE_TYPES[file.type];
  if (!ext) return jsonError("Faqat JPG, PNG, WEBP, AVIF yoki GIF rasm yuklash mumkin");
  if (file.size > MAX_UPLOAD_BYTES) return jsonError("Rasm hajmi 5 MB dan oshmasligi kerak");

  const name = `${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${name}`, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  }

  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/api/uploads/${name}` }, { status: 201 });
}
