/**
 * 360° aylanish: kadr hisoblari va fonni olib tashlash.
 * Sof funksiyalar — admin brauzerida ham, testlarda ham ishlaydi.
 */

/** Bitta aylanishdan olinadigan kadrlar soni (har 10°) */
export const SPIN_FRAME_COUNT = 36;
export const SPIN_MAX_FRAMES = 72;

export type Rgb = [number, number, number];
export type Bounds = { x0: number; y0: number; x1: number; y1: number };

/** Kadr indeksini aylana bo'ylab 0..count-1 oralig'iga keltiradi */
export function wrapFrame(position: number, count: number): number {
  if (count <= 0) return 0;
  return ((Math.round(position) % count) + count) % count;
}

/** To'liq aylanish oralig'idan teng qadamli vaqtlar (oxirgi kadr boshlanishni takrorlamaydi) */
export function frameTimes(start: number, end: number, count = SPIN_FRAME_COUNT): number[] {
  const step = (end - start) / count;
  return Array.from({ length: count }, (_, i) => start + i * step);
}

/** Ikki kichik kulrang kadr orasidagi o'rtacha farq (0..255) */
export function frameDifference(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const length = Math.min(a.length, b.length);
  if (!length) return 0;
  let sum = 0;
  for (let i = 0; i < length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / length;
}

/**
 * Aylanish qayerda yopilishini topadi: birinchi kadrga eng o'xshash keyingi kadr vaqti.
 * diffs[i] — times[i] dagi kadrning birinchi kadrdan farqi.
 * Videoning `minFraction` qismidan keyin qidiriladi (yarim burilishdagi o'xshashlikka aldanmaslik uchun).
 * Ishonchli minimum topilmasa — null (butun video olinadi).
 */
export function findLoopEnd(diffs: number[], times: number[], minFraction = 0.45): number | null {
  if (diffs.length < 8 || diffs.length !== times.length) return null;
  const first = times[0];
  const span = times[times.length - 1] - first;
  let best = -1;
  for (let i = 1; i < diffs.length; i++) {
    if (times[i] - first < span * minFraction) continue;
    if (best === -1 || diffs[i] < diffs[best]) best = i;
  }
  if (best === -1) return null;
  const sorted = [...diffs.slice(1)].sort((x, y) => x - y);
  const median = sorted[Math.floor(sorted.length / 2)];
  // Minimum boshqa kadrlardan yaqqol ajralib turishi kerak
  if (median <= 0 || diffs[best] > median * 0.45) return null;
  return times[best];
}

function chroma(r: number, g: number, b: number): [number, number, number] {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  return [y, 0.564 * (b - y), 0.713 * (r - y)];
}

/**
 * Rangning fon rangidan uzoqligi. Asosan rang tusiga qaraladi, yorug'lik kamroq hisobga olinadi —
 * shunda mahsulot fonga tashlagan soya ham fon deb topiladi.
 */
export function backdropDistance(r: number, g: number, b: number, key: Rgb): number {
  const [y, cb, cr] = chroma(r, g, b);
  const [ky, kcb, kcr] = chroma(key[0], key[1], key[2]);
  return Math.hypot(cb - kcb, cr - kcr, (y - ky) * 0.35);
}

/** Kadr chetlaridan fon rangini taxmin qiladi (tepa burchaklar odatda faqat fon) */
export function guessBackdrop(data: Uint8ClampedArray, width: number, height: number): Rgb {
  const band = Math.max(2, Math.round(Math.min(width, height) * 0.06));
  const sum = [0, 0, 0];
  let n = 0;
  for (let y = 0; y < band; y++) {
    for (let x = 0; x < width; x++) {
      if (x > band && x < width - band && y > band / 2) continue;
      const i = (y * width + x) * 4;
      sum[0] += data[i];
      sum[1] += data[i + 1];
      sum[2] += data[i + 2];
      n++;
    }
  }
  return [Math.round(sum[0] / n), Math.round(sum[1] / n), Math.round(sum[2] / n)];
}

/**
 * Fonni shaffof qiladi (RGBA massiv joyida o'zgaradi).
 * - Kadr chetidan tutash fon `tolerance` bo'yicha olib tashlanadi.
 * - Ichki teshiklardagi fon (masalan, dasta orasi) faqat rang juda yaqin bo'lsa olinadi —
 *   mahsulotdagi fonga o'xshash yaltiroq joylar teshilib qolmasin.
 * - Chegara yumshoq: alfa 0 dan 255 gacha silliq o'tadi, chetdagi fon rangi tusi so'ndiriladi.
 */
export function removeBackdrop(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  key: Rgb,
  tolerance: number,
): void {
  const total = width * height;
  const distance = new Float32Array(total);
  for (let p = 0; p < total; p++) {
    const i = p * 4;
    distance[p] = backdropDistance(data[i], data[i + 1], data[i + 2], key);
  }

  // Chetdan tutash fon
  const outer = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const seed = (p: number) => {
    if (!outer[p] && distance[p] < tolerance) {
      outer[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    seed(x);
    seed((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    seed(y * width);
    seed(y * width + width - 1);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    if (x > 0) seed(p - 1);
    if (x < width - 1) seed(p + 1);
    if (p >= width) seed(p - width);
    if (p < total - width) seed(p + width);
  }

  const inner = tolerance * 0.55;
  for (let p = 0; p < total; p++) {
    const d = distance[p];
    const limit = outer[p] ? tolerance : inner;
    if (d >= limit * 1.6) continue;
    const i = p * 4;
    // limit*0.7 gacha — to'liq fon, limit gacha — yumshoq chegara
    const alpha = Math.min(1, Math.max(0, (d - limit * 0.7) / (limit * 0.3)));
    if (alpha < 1) data[i + 3] = Math.round(data[i + 3] * alpha);
    // Fon rangi yuqib qolgan chetlarni kulranglashtiramiz
    const spill = Math.min(1, Math.max(0, 1 - (d - limit) / (limit * 0.6))) * 0.7;
    if (spill > 0) {
      const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] += (y - data[i]) * spill;
      data[i + 1] += (y - data[i + 1]) * spill;
      data[i + 2] += (y - data[i + 2]) * spill;
    }
  }
}

/** Ko'rinadigan (alfa > threshold) piksellar chegarasi; bo'sh kadr bo'lsa — null */
export function alphaBounds(data: Uint8ClampedArray, width: number, height: number, threshold = 24): Bounds | null {
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= threshold) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

/** Bir nechta chegaralarning birlashmasi, `margin` ulushida zaxira bilan, kadr ichida */
export function unionBounds(list: (Bounds | null)[], width: number, height: number, margin = 0.04): Bounds | null {
  const valid = list.filter((b): b is Bounds => b !== null);
  if (!valid.length) return null;
  const x0 = Math.min(...valid.map((b) => b.x0));
  const y0 = Math.min(...valid.map((b) => b.y0));
  const x1 = Math.max(...valid.map((b) => b.x1));
  const y1 = Math.max(...valid.map((b) => b.y1));
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * margin);
  return {
    x0: Math.max(0, x0 - pad),
    y0: Math.max(0, y0 - pad),
    x1: Math.min(width, x1 + pad),
    y1: Math.min(height, y1 + pad),
  };
}
