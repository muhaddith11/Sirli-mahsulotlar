/**
 * Jonli aylanish modellari: kadrlar o'rniga har kadrda real vaqtda chiziladi (agrumeafarm.it uslubida).
 * Model kadrlar katalogiga bog'langan — egasi admin'dan o'z kadrlarini yuklasa, oddiy kadrlar ishlaydi.
 * Bu fayl three.js'ni yuklamaydi: qaror tez qabul qilinadi, og'ir qism kerak bo'lgandagina keladi.
 */

export type LiveModel = { kind: "teapot" | "layers"; base: string };

/** Katalog → model turi. Kadrlar shu modeldan chizilgan, shuning uchun burchaklar aynan mos */
const MODELS: Record<string, LiveModel["kind"]> = {
  "choynak-gilos": "teapot",
  "pot-strawberry": "layers",
  "pot-cherry": "layers",
  "bowl-spring": "layers",
  "ladle-blue": "layers",
  "mug-cherry": "layers",
  "set-poppy": "layers",
};

/** Kadrlar hammasi /spin/<katalog>/ ichida va katalogning modeli bo'lsa — jonli model */
export function liveModelFor(frames: string[]): LiveModel | null {
  const match = frames[0]?.match(/^\/spin\/([a-z0-9-]+)\//);
  const kind = match ? MODELS[match[1]] : undefined;
  if (!match || !kind) return null;
  const prefix = match[0];
  if (!frames.every((frame) => frame.startsWith(prefix))) return null;
  return { kind, base: `${prefix}live/` };
}
