import { readFile } from "node:fs/promises";
import path from "node:path";
import { jsonError } from "@/lib/api";
import { contentTypeFor, getUploadDir, isSafeUploadName } from "@/lib/uploads";

/** GET /api/uploads/:file — admin yuklagan mahsulot rasmlari */
export async function GET(_request: Request, { params }: RouteContext<"/api/uploads/[file]">) {
  const { file } = await params;
  if (!isSafeUploadName(file)) return jsonError("Fayl topilmadi", 404);

  try {
    const data = await readFile(path.join(getUploadDir(), file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeFor(file),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return jsonError("Fayl topilmadi", 404);
  }
}
