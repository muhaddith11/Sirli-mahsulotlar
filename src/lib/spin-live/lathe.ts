import * as THREE from "three";

/**
 * Aylanish jismi, o'lchamlar rasm pikselida (100px = 1 birlik): [radius, tagidan balandlik].
 * wrap — tekstura koordinatasi: u (atrof bo'ylab 0..1), s (profil bo'ylab yo'l), total (profil uzunligi).
 * Teksturani yoy bo'ylab yoyamiz: tik joylarda sepkillar cho'zilib ketmaydi.
 */
export function lathe(
  points: number[][],
  material: THREE.Material,
  wrap: (u: number, s: number, total: number) => [number, number],
  smooth = 4,
) {
  const spline = new THREE.SplineCurve(points.map(([r, h]) => new THREE.Vector2(r / 100, h / 100)));
  const samples = spline.getPoints(points.length * smooth).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  const lengths = [0];
  for (let i = 1; i < samples.length; i++) lengths.push(lengths[i - 1] + samples[i].distanceTo(samples[i - 1]));
  const total = lengths[lengths.length - 1];
  const geometry = new THREE.LatheGeometry(samples, 96);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const [a, b] = wrap(uv.getX(i), lengths[i % samples.length], total);
    uv.setXY(i, a, b);
  }
  return new THREE.Mesh(geometry, material);
}

/** Tepadan qarab tekis yoyish: qopqoq kabi markazga yig'iladigan sirtlar uchun (s — chetidan markazga) */
export const fromAbove =
  (tile: number) =>
  (u: number, s: number, total: number): [number, number] => {
    const r = (total - s) / tile;
    const a = u * Math.PI * 2;
    return [Math.cos(a) * r + 0.5, Math.sin(a) * r + 0.5];
  };
