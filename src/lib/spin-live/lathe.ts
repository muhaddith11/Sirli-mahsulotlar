import * as THREE from "three";

type Wrap = (u: number, s: number, total: number, y: number) => [number, number];

/**
 * Aylanish jismi, o'lchamlar rasm pikselida (100px = 1 birlik): [radius, tagidan balandlik].
 * wrap — tekstura koordinatasi: u (atrof bo'ylab 0..1), s (profil bo'ylab yo'l), total (profil uzunligi), y (balandlik).
 * Teksturani yoy bo'ylab yoyamiz: tik joylarda sepkillar cho'zilib ketmaydi.
 * relief — radiusga qo'shimcha (burchak, balandlik bo'yicha): tarnovlar va bo'rtmalar uchun.
 */
export function lathe(
  points: number[][],
  material: THREE.Material,
  wrap: Wrap,
  smooth = 4,
  { segments = 96, relief }: { segments?: number; relief?: (angle: number, y: number) => number } = {},
) {
  const spline = new THREE.SplineCurve(points.map(([r, h]) => new THREE.Vector2(r / 100, h / 100)));
  const samples = spline.getPoints(points.length * smooth).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  const lengths = [0];
  for (let i = 1; i < samples.length; i++) lengths.push(lengths[i - 1] + samples[i].distanceTo(samples[i - 1]));
  const total = lengths[lengths.length - 1];
  const geometry = new THREE.LatheGeometry(samples, segments);
  const uv = geometry.attributes.uv;
  const pos = geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const j = i % samples.length;
    if (relief) {
      const scale = 1 + relief(u * Math.PI * 2, samples[j].y) / Math.max(samples[j].x, 1e-3);
      pos.setXYZ(i, pos.getX(i) * scale, pos.getY(i), pos.getZ(i) * scale);
    }
    const [a, b] = wrap(u, lengths[j], total, samples[j].y);
    uv.setXY(i, a, b);
  }
  if (relief) {
    geometry.computeVertexNormals();
    // Chok: birinchi va oxirgi ustun bitta chiziq, normallari ham bir xil bo'lsin
    const normal = geometry.attributes.normal;
    const rows = samples.length;
    for (let j = 0; j < rows; j++) {
      const a = j;
      const b = segments * rows + j;
      const n = new THREE.Vector3(normal.getX(a) + normal.getX(b), normal.getY(a) + normal.getY(b), normal.getZ(a) + normal.getZ(b)).normalize();
      normal.setXYZ(a, n.x, n.y, n.z);
      normal.setXYZ(b, n.x, n.y, n.z);
    }
  }
  return new THREE.Mesh(geometry, material);
}

/** Tepadan qarab tekis yoyish: qopqoq kabi markazga yig'iladigan sirtlar uchun (s — chetidan markazga) */
export const fromAbove =
  (tile: number): Wrap =>
  (u, s, total) => {
    const r = (total - s) / tile;
    const a = u * Math.PI * 2;
    return [Math.cos(a) * r + 0.5, Math.sin(a) * r + 0.5];
  };

/** Faqat rang va aks kerak bo'lgan sirt */
export const plain: Wrap = () => [0, 0];

/** Profil bo'yicha radius: balandlik → radius (birlikda) */
export function radiusAt(points: number[][]) {
  const curve = new THREE.SplineCurve(points.map(([r, h]) => new THREE.Vector2(r / 100, h / 100))).getPoints(points.length * 8);
  return (y: number) => {
    let best = curve[0];
    for (const p of curve) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p;
    return best.x;
  };
}

/**
 * Egri chiziq bo'ylab oval kesim. section(t) — [yarim kenglik, yarim qalinlik].
 * flatSide berilsa, kesim shu o'q bo'ylab kengayadi — tik ketadigan yassi dastalar uchun.
 */
export function sweep(
  curve: THREE.Curve<THREE.Vector3>,
  section: (t: number) => [number, number],
  material: THREE.Material,
  { tile = 6, flatSide }: { tile?: number; flatSide?: THREE.Vector3 } = {},
) {
  const N = 120;
  const M = 24;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const length = curve.getLength();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const side = flatSide ? flatSide.clone() : new THREE.Vector3().crossVectors(tangent, up).normalize();
    const normal = new THREE.Vector3().crossVectors(side, tangent).normalize();
    const [wide, thick] = section(t);
    for (let j = 0; j <= M; j++) {
      const a = (j / M) * Math.PI * 2;
      const q = p.clone().addScaledVector(side, Math.cos(a) * wide).addScaledVector(normal, Math.sin(a) * thick);
      positions.push(q.x, q.y, q.z);
      uvs.push((t * length) / tile, (a * (wide + thick)) / tile);
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j;
      const b = a + M + 1;
      index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

/** Tekis nuqtalar orqali egri chiziq: [x, y] rasm pikselida, z = 0 tekisligida */
export const planeCurve = (points: number[][]) =>
  new THREE.CatmullRomCurve3(points.map(([x, h]) => new THREE.Vector3(x / 100, h / 100, 0)), false, "centripetal");

/**
 * Sirtga yopishgan bosma: tana ustidagi bo'lak. angle — +Z dan +X tomonga, radianda;
 * kameradan qaraganda u o'ngga o'sadi.
 */
export function decal(radius: (y: number) => number, angles: [number, number], heights: [number, number], material: THREE.Material, lift = 0.012) {
  const COLUMNS = 40;
  const ROWS = 16;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= ROWS; j++) {
    const v = j / ROWS;
    const y = THREE.MathUtils.lerp(heights[0], heights[1], v);
    const r = radius(y) + lift;
    for (let i = 0; i <= COLUMNS; i++) {
      const u = i / COLUMNS;
      const a = THREE.MathUtils.lerp(angles[0], angles[1], u);
      positions.push(Math.sin(a) * r, y, Math.cos(a) * r);
      uvs.push(u, v);
    }
  }
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLUMNS; i++) {
      const a = j * (COLUMNS + 1) + i;
      const b = a + COLUMNS + 1;
      index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}
