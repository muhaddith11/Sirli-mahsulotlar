import * as THREE from "three";
import { addStudio } from "./studio";

/**
 * "Gilos" choynagining 3D modeli — 360° kadrlar aynan shu sahnadan chizilgan
 * (bir xil kamera, yorug'lik va qirqish), shuning uchun jonli ko'rinish kadrlar bilan mos tushadi.
 */

/** Egasining rasmidan o'lchangan shakl (rasm pikselida: [radius, y]) */
const PROFILE = {
  enamel: [204, 212, 226],
  body: [[270, 1748], [330, 1738], [372, 1716], [405, 1690], [432, 1660], [452, 1620], [461, 1560], [463, 1500], [462, 1400], [455, 1320], [440, 1250], [416, 1192], [383, 1142], [350, 1102], [334, 1078]],
  lid: [[322, 1032], [321, 992], [306, 946], [272, 906], [218, 870], [152, 850], [96, 842], [40, 838]],
  spoutCrop: [1000, 980, 1460, 1360],
};
const BASE = 1748;
const AXIS = 683;
const SIN_E = 0.095;
const Y = (y: number) => (BASE - y) / 100;
const X = (x: number) => (x - AXIS) / 100;

/** Kadrlar 1080px sahnadan shu to'rtburchak bo'yicha qirqilgan */
const RENDER = 1080;
const CROP = { x: 58, y: 89, width: 963, height: 904 };

const ENV = 1.3;
const ROUGH = 0.4;
const CC = 1;
const CCR = 0.04;
const TINT = 1.07;

export async function createTeapot(renderer: THREE.WebGLRenderer, base: string) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer);

  const loader = new THREE.TextureLoader();
  const texture = async (name: string) => {
    const t = await loader.loadAsync(base + name);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const [bodyMap, lidMap, spoutMap] = await Promise.all([texture("body.jpg"), texture("lid.jpg"), texture("spout.jpg")]);

  const warm = new THREE.Color(TINT, TINT * 0.985, TINT * 0.95);
  const glossy = (map: THREE.Texture) =>
    new THREE.MeshPhysicalMaterial({ map, color: warm, roughness: ROUGH, metalness: 0, clearcoat: CC, clearcoatRoughness: CCR, envMapIntensity: ENV });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe8ebef, roughness: 0.07, metalness: 1, envMapIntensity: 1.4 });
  const aluminum = new THREE.MeshStandardMaterial({ color: 0xd6d9dd, roughness: 0.2, metalness: 1, envMapIntensity: 1.3, side: THREE.DoubleSide });
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0xe0d9c6, roughness: 0.4, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.08, envMapIntensity: ENV });
  const enamelMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(`rgb(${PROFILE.enamel.join(",")})`),
    roughness: ROUGH,
    metalness: 0,
    clearcoat: CC,
    clearcoatRoughness: CCR,
    envMapIntensity: ENV,
  });
  const rim = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.4, metalness: 0.2 });

  const teapot = new THREE.Group();
  scene.add(teapot);

  /** Lathe; v — balandlik bo'yicha [y0, y1] oralig'ida (tekstura qatorlari rasm y'iga mos) */
  const lathe = (points: number[][], material: THREE.Material, y0?: number, y1?: number, segments = 160) => {
    const geometry = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
    if (y0 !== undefined && y1 !== undefined) {
      const pos = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setY(i, THREE.MathUtils.clamp((pos.getY(i) - y0) / (y1 - y0), 0, 1));
    }
    geometry.computeVertexNormals();
    teapot.add(new THREE.Mesh(geometry, material));
  };

  // Tana, xrom halqa, qopqoq, tutqich
  const bodyPts = PROFILE.body.map(([r, y]) => [r / 100, Y(y)]).sort((a, b) => a[1] - b[1]);
  lathe([[0, 0], ...bodyPts, [3.26, Y(1074)]], glossy(bodyMap), 0, Y(1078));
  lathe([[3.22, Y(1080)], [3.38, Y(1076)], [3.42, Y(1062)], [3.4, Y(1046)], [3.26, Y(1040)]], chrome);
  const lidPts = PROFILE.lid.map(([r, y]) => [r / 100, Y(y)]).sort((a, b) => a[1] - b[1]);
  lathe([[3.26, Y(1040)], ...lidPts, [0, Y(836)]], glossy(lidMap), Y(1034), Y(836));
  lathe([[0.95, Y(842)], [0.92, Y(826)], [0.78, Y(820)], [0.76, Y(800)], [0.6, Y(796)], [0, Y(796)]], plastic, undefined, undefined, 96);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.82, 64, 48), plastic);
  ball.position.y = Y(767);
  teapot.add(ball);

  // Jo'mrak: radiusi o'zgaruvchan quvur, rasm tekisligidan proyeksiya qilingan tekstura bilan
  {
    const centre = [[1020, 1272, 1.0], [1110, 1258, 0.95], [1200, 1222, 0.82], [1300, 1164, 0.62], [1362, 1108, 0.44], [1408, 1066, 0.33]];
    const curve = new THREE.CatmullRomCurve3(centre.map(([x, y]) => new THREE.Vector3(X(x), Y(y), 0)));
    const radius = (t: number) => {
      const f = t * (centre.length - 1);
      const i = Math.min(centre.length - 2, Math.floor(f));
      return THREE.MathUtils.lerp(centre[i][2], centre[i + 1][2], f - i);
    };
    const N = 80;
    const M = 48;
    const positions: number[] = [];
    const uvs: number[] = [];
    const index: number[] = [];
    const [cx0, cy0, cx1, cy1] = PROFILE.spoutCrop;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = curve.getPointAt(t);
      const r = radius(t);
      const tangent = curve.getTangentAt(t);
      const n = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      const b = new THREE.Vector3(0, 0, 1);
      for (let j = 0; j <= M; j++) {
        const a = (j / M) * Math.PI * 2;
        const v = p.clone().addScaledVector(n, Math.cos(a) * r).addScaledVector(b, Math.sin(a) * r);
        positions.push(v.x, v.y, v.z);
        const px = v.x * 100 + AXIS;
        const py = BASE - v.y * 100 + Math.abs(v.z) * 100 * SIN_E;
        uvs.push((px - cx0) / (cx1 - cx0), 1 - (py - cy0) / (cy1 - cy0));
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        const a = i * (M + 1) + j;
        const b = a + M + 1;
        index.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    const spoutMat = glossy(spoutMap);
    spoutMat.side = THREE.DoubleSide;
    teapot.add(new THREE.Mesh(geometry, spoutMat));
    // Uchidagi qora gardish va ichki qopqoq
    const tip = curve.getPointAt(1);
    const dir = curve.getTangentAt(1);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius(1) - 0.02, 0.035, 12, 48), rim);
    ring.position.copy(tip);
    ring.lookAt(tip.clone().add(dir));
    teapot.add(ring);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(radius(1) - 0.03, 32), rim);
    cap.position.copy(tip).addScaledVector(dir, -0.12);
    cap.lookAt(tip.clone().add(dir));
    teapot.add(cap);
  }

  // Dasta: yassi alyuminiy tasma (yumaloq to'rtburchak kesim) rasmdagi chiziq bo'ylab
  {
    const path = [[262, 1000], [240, 940], [226, 860], [217, 760], [205, 680], [215, 600], [244, 540], [300, 482], [420, 452], [700, 450], [960, 458], [1080, 482], [1160, 535], [1200, 610], [1216, 700], [1208, 800], [1186, 880], [1166, 940], [1112, 1000]];
    const curve = new THREE.CatmullRomCurve3(path.map(([x, y]) => new THREE.Vector3(X(x), Y(y), 0)), false, "centripetal");
    const W = 0.3;
    const D = 0.26;
    const R = 0.09;
    const shape: number[][] = [];
    for (let k = 0; k < 4; k++) {
      const cxs = [1, -1, -1, 1][k];
      const cys = [1, 1, -1, -1][k];
      for (let s = 0; s <= 6; s++) {
        const a = (k * Math.PI) / 2 + (s / 6) * (Math.PI / 2);
        shape.push([cxs * (W - R) + Math.cos(a) * R, cys * (D - R) + Math.sin(a) * R]);
      }
    }
    const N = 220;
    const M = shape.length;
    const positions: number[] = [];
    const index: number[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const n = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      for (const [u, w] of shape) {
        const v = p.clone().addScaledVector(n, u).add(new THREE.Vector3(0, 0, w));
        positions.push(v.x, v.y, v.z);
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        const a = i * M + j;
        const b = i * M + ((j + 1) % M);
        index.push(a, a + M, b, b, a + M, b + M);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    teapot.add(new THREE.Mesh(geometry, aluminum));

    // Quloqchalar: tananing yelkasiga payvandlangan emal plastina, yuqorisida dasta parchin bilan ilinadi
    const sorted = PROFILE.body.slice().sort((a, b) => a[1] - b[1]);
    const bodyR = (y: number) => {
      for (let k = 0; k < sorted.length - 1; k++) {
        const [r0, y0] = sorted[k];
        const [r1, y1] = sorted[k + 1];
        if (y >= y0 && y <= y1) return (r0 + (r1 - r0) * ((y - y0) / (y1 - y0))) / 100;
      }
      return sorted[0][0] / 100;
    };
    for (const [px, sign] of [[262, -1], [1112, 1]]) {
      const pivot = new THREE.Vector2(X(px), Y(1000));
      const out = (y: number) => sign * (bodyR(y) - 0.04);
      const lugShape = new THREE.Shape();
      lugShape.moveTo(sign * (bodyR(1185) - 0.8), Y(1185));
      lugShape.lineTo(out(1185), Y(1185));
      lugShape.quadraticCurveTo(out(1120) + sign * 0.18, Y(1110), pivot.x + sign * 0.3, pivot.y - 0.05);
      lugShape.absarc(pivot.x, pivot.y, 0.3, sign > 0 ? 0 : Math.PI, sign > 0 ? Math.PI : 0, sign < 0);
      lugShape.quadraticCurveTo(pivot.x - sign * 0.25, Y(1060), out(1092), Y(1092));
      lugShape.lineTo(sign * (bodyR(1092) - 0.8), Y(1092));
      lugShape.closePath();
      const lug = new THREE.Mesh(
        new THREE.ExtrudeGeometry(lugShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 24 }),
        enamelMat,
      );
      lug.position.z = -0.15;
      teapot.add(lug);
      for (const z of [0.29, -0.29]) {
        const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24), chrome);
        rivet.rotation.x = Math.PI / 2;
        rivet.position.set(pivot.x, pivot.y, z);
        teapot.add(rivet);
      }
    }
  }

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 200);
  const elevation = (9 * Math.PI) / 180;
  const distance = 33;
  const targetY = 6.4;
  camera.position.set(0, targetY + distance * Math.sin(elevation), distance * Math.cos(elevation));
  camera.lookAt(0, targetY, 0);
  // Kadrlar qirqilgan joyni ko'rsatadi: jonli ko'rinish kadrlar bilan bir xil joylashadi
  camera.setViewOffset(RENDER, RENDER, CROP.x, CROP.y, CROP.width, CROP.height);

  return {
    width: CROP.width,
    height: CROP.height,
    scene,
    camera,
    turn: (degrees: number) => {
      teapot.rotation.y = (degrees * Math.PI) / 180;
    },
  };
}
