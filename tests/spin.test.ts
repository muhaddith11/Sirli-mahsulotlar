import { describe, expect, it } from "vitest";
import {
  alphaBounds,
  backdropDistance,
  findLoopEnd,
  frameTimes,
  removeBackdrop,
  unionBounds,
  wrapFrame,
  type Rgb,
} from "@/lib/spin";

const BLUE: Rgb = [40, 110, 205];
const WHITE: Rgb = [245, 245, 240];

/** width×height rasm: fon BLUE, berilgan piksellar boshqa rangda */
function image(width: number, height: number, paint: (x: number, y: number) => Rgb | null) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = paint(x, y) ?? BLUE;
      data.set([r, g, b, 255], (y * width + x) * 4);
    }
  }
  return data;
}
const alphaAt = (data: Uint8ClampedArray, width: number, x: number, y: number) => data[(y * width + x) * 4 + 3];

describe("360° kadr hisoblari", () => {
  it("kadr indeksi aylana bo'ylab o'raladi", () => {
    expect(wrapFrame(0, 36)).toBe(0);
    expect(wrapFrame(37, 36)).toBe(1);
    expect(wrapFrame(-1, 36)).toBe(35);
    expect(wrapFrame(35.6, 36)).toBe(0);
  });

  it("vaqtlar teng qadamli, oxirgisi boshlanishni takrorlamaydi", () => {
    const times = frameTimes(1, 10, 36);
    expect(times).toHaveLength(36);
    expect(times[0]).toBe(1);
    expect(times[1] - times[0]).toBeCloseTo(0.25);
    expect(times[35]).toBeLessThan(10);
  });

  it("aylanish oxirini yarim burilishdagi o'xshashlikka aldanmay topadi", () => {
    const times = Array.from({ length: 73 }, (_, i) => i / 6); // 0..12 s
    const diffs = times.map((t) => {
      if (t === 0) return 0;
      if (Math.abs(t - 10) < 0.01) return 2; // to'liq aylanish
      if (Math.abs(t - 5) < 0.01) return 18; // yarim burilish ham biroz o'xshaydi
      return 40;
    });
    expect(findLoopEnd(diffs, times)).toBeCloseTo(10);
  });

  it("aniq minimum bo'lmasa — null", () => {
    const times = Array.from({ length: 30 }, (_, i) => i / 3);
    const diffs = times.map((_, i) => (i === 0 ? 0 : 30 + (i % 3)));
    expect(findLoopEnd(diffs, times)).toBeNull();
  });
});

describe("fonni olib tashlash", () => {
  it("soya fon deb, oq mahsulot fon emas deb baholanadi", () => {
    const shadow: Rgb = [25, 70, 135];
    expect(backdropDistance(...shadow, BLUE)).toBeLessThan(backdropDistance(...WHITE, BLUE));
    expect(backdropDistance(...BLUE, BLUE)).toBe(0);
  });

  it("chetdagi fon va ichki teshik shaffof, mahsulot va fonga o'xshash ichki joy qoladi", () => {
    const size = 24;
    const nearBlue: Rgb = [90, 130, 190]; // fonga o'xshash, lekin aynan emas (yaltiroq joy)
    const data = image(size, size, (x, y) => {
      const inSquare = x >= 4 && x < 20 && y >= 4 && y < 20;
      if (!inSquare) return null;
      if (x >= 10 && x < 12 && y >= 10 && y < 12) return null; // dasta orasidagi fon — aynan BLUE
      if (x === 15 && y === 15) return nearBlue;
      return WHITE;
    });
    removeBackdrop(data, size, size, BLUE, 46);
    expect(alphaAt(data, size, 0, 0)).toBe(0);
    expect(alphaAt(data, size, 23, 12)).toBe(0);
    expect(alphaAt(data, size, 6, 6)).toBe(255);
    expect(alphaAt(data, size, 10, 10)).toBe(0);
    expect(alphaAt(data, size, 15, 15)).toBe(255);
  });

  it("ko'rinadigan chegara va birlashma zaxira bilan hisoblanadi", () => {
    const size = 20;
    const data = new Uint8ClampedArray(size * size * 4); // hammasi shaffof
    for (let y = 5; y < 9; y++) for (let x = 6; x < 10; x++) data[(y * size + x) * 4 + 3] = 255;
    const bounds = alphaBounds(data, size, size);
    expect(bounds).toEqual({ x0: 6, y0: 5, x1: 10, y1: 9 });
    expect(unionBounds([bounds, { x0: 2, y0: 3, x1: 8, y1: 12 }, null], size, size, 0)).toEqual({ x0: 2, y0: 3, x1: 10, y1: 12 });
    expect(unionBounds([null], size, size)).toBeNull();
  });
});
