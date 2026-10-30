import * as THREE from "three";
import { addStudio } from "./studio";

/**
 * Emal choynak 3D modeli — egasining rasmlaridan o'lchangan; bir qolipdagi choynaklar shu shaklda.
 * O'lchamlar old rasm pikselida (100px = 1 birlik): [radius, qator].
 * Tana naqshi body.webp'da: u=0.25 — old, u=0.75 — orqa, u=0.5 — jo'mrak tomoni.
 */

export type KettleStyle = {
  /** Emal rangi: qopqoq, jo'mrak, quloqchalar */
  color: string;
  /** mask — oq-qora niqob emal rangiga ko'paytiriladi; photo — tekstura o'z rangi bilan */
  print: "mask" | "photo";
  /** Qopqoq tutqichining burilishi, gradus */
  knob?: number;
};

/** Rasm ~12° yuqoridan olingan: balandliklar shuncha qisqarib ko'ringan */
const ELEVATION = (12 * Math.PI) / 180;
const FOOT = 1077;
const PX = 100;
const Y = (row: number) => (FOOT - row) / (PX * Math.cos(ELEVATION));
const R = (px: number) => px / PX;

/** Kadrlar shu sahnadan shu to'rtburchak bo'yicha qirqiladi */
const RENDER = 1080;
const CROP = { x: 128, y: 146, width: 823, height: 932 };

const ENV = 1.3;

/** Tana: tagidan bo'yingacha */
const BODY = [[0, 1054], [96, 1054], [110, 1061], [124, 1074], [160, 1078], [190, 1062], [212, 1032], [226, 1000], [237, 965], [245, 930], [250, 895], [252, 860], [253, 825], [253, 790], [252, 755], [250, 725], [246, 695], [240, 668], [230, 643], [216, 620], [208, 600], [205, 588]];
/** Rim: tashqariga buklangan lab, ichkariga botiq, keyin qopqoq va uning do'ngi */
const TOP = [[205, 588], [207, 576], [214, 562], [222, 550], [225, 541], [222, 534], [214, 533], [204, 538], [196, 546], [184, 553], [165, 557], [140, 558], [122, 556], [112, 548], [100, 538], [85, 531], [60, 529], [0, 529]];
/** Lab ostidagi ingichka qora chiziq */
const EDGE = [[223.5, 551], [225.5, 546], [226.3, 541]];
/** Dasta o'qi (o'ng yarmi, tepadan pastga): [o'qdan masofa, qator] */
const HANDLE = [[0, 239], [100, 242], [200, 256], [232, 276], [251, 308], [256, 345], [251, 393], [245, 443], [239, 493], [234, 526]];
/** Quloqcha: rim ostidan chiqib, dasta parchinini ushlaydi */
const LUG = [[200, 592], [248, 592], [250, 566], [251, 514], [240, 510], [238, 560], [204, 566]];
const PIVOT = [244, 524];

function lathe(group: THREE.Group, points: number[][], material: THREE.Material, y0?: number, y1?: number, smooth = 4) {
  const spline = new THREE.SplineCurve(points.map(([r, row]) => new THREE.Vector2(R(r), Y(row))));
  const samples = spline.getPoints(points.length * smooth).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  const geometry = new THREE.LatheGeometry(samples, 96);
  if (y0 !== undefined && y1 !== undefined) {
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setY(i, THREE.MathUtils.clamp((pos.getY(i) - y0) / (y1 - y0), 0, 1));
  }
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
  return mesh;
}

export async function createKettle(renderer: THREE.WebGLRenderer, base: string, style: KettleStyle) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer, { fill: false });

  const map = await new THREE.TextureLoader().loadAsync(base + "body.webp");
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const enamel = (options: THREE.MeshPhysicalMaterialParameters) =>
    new THREE.MeshPhysicalMaterial({ roughness: 0.4, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: ENV, ...options });
  const shell = enamel({ color: style.color });
  const black = enamel({ color: 0x0c0c0e, roughness: 0.35 });
  const handleMat = enamel({ color: 0x070708, roughness: 0.34, clearcoat: 0.6, envMapIntensity: 0.4, side: THREE.DoubleSide });
  const steel = new THREE.MeshStandardMaterial({ color: 0xd8dade, roughness: 0.18, metalness: 1, envMapIntensity: 1.3 });

  const kettle = new THREE.Group();
  scene.add(kettle);

  // Tana: u=0.25 kameraga, jo'mrak esa u=0.5 tomonda (+X) tursin
  // Niqob bosma yuz: emal kabi yaltiramaydi, shuning uchun lak qatlamini ham o'chiradi
  const skin = style.print === "mask" ? { color: style.color, map, clearcoatMap: map } : { color: "#ffffff", map };
  const body = lathe(kettle, BODY, enamel(skin), Y(1080), Y(585));
  body.rotation.y = -Math.PI / 2;
  lathe(kettle, TOP, shell);
  lathe(kettle, EDGE, black);

  // Qopqoq tutqichi: halqa
  {
    const arch = [[-17, 536], [-17, 510], [-11, 488], [0, 481], [11, 488], [17, 510], [17, 536]];
    const curve = new THREE.CatmullRomCurve3(arch.map(([x, row]) => new THREE.Vector3(R(x), Y(row), 0)));
    const knob = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.095, 20, false), shell);
    knob.rotation.y = ((style.knob ?? 0) * Math.PI) / 180;
    kettle.add(knob);
  }

  // Jo'mrak: to'g'ri konus, kesimi yassi ellips; uchi deyarli gorizontal kesilgan
  {
    const from = new THREE.Vector3(R(590 - 415), Y(760), 0);
    const to = new THREE.Vector3(R(783 - 415), Y(578), 0);
    const axis = to.clone().sub(from);
    const d = axis.clone().normalize();
    const n = new THREE.Vector3(-d.y, d.x, 0);
    const z = new THREE.Vector3(0, 0, 1);
    const SHEAR = -0.62;
    const ring = (t: number, a: number) => {
      const half = THREE.MathUtils.lerp(0.89, 0.24, t);
      const depth = THREE.MathUtils.lerp(0.7, 0.17, t);
      const c = from.clone().addScaledVector(axis, t);
      return c
        .addScaledVector(n, Math.cos(a) * half)
        .addScaledVector(z, Math.sin(a) * depth)
        .addScaledVector(d, SHEAR * Math.cos(a) * half);
    };
    const N = 40;
    const M = 64;
    const positions: number[] = [];
    const index: number[] = [];
    for (let i = 0; i <= N; i++) {
      for (let j = 0; j < M; j++) {
        const p = ring(i / N, (j / M) * Math.PI * 2);
        positions.push(p.x, p.y, p.z);
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        const a = i * M + j;
        const b = i * M + ((j + 1) % M);
        index.push(a, b, a + M, b, b + M, a + M);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    kettle.add(new THREE.Mesh(geometry, shell));
    // Uchi: qora gardish va qorong'i teshik
    const edge: THREE.Vector3[] = [];
    for (let j = 0; j < M; j++) edge.push(ring(1, (j / M) * Math.PI * 2));
    const rim = new THREE.CatmullRomCurve3(edge, true);
    kettle.add(new THREE.Mesh(new THREE.TubeGeometry(rim, 96, 0.022, 10, true), black));
    const hole = new THREE.BufferGeometry();
    const centre = from.clone().addScaledVector(axis, 0.985);
    const fan: number[] = [centre.x, centre.y, centre.z];
    for (let j = 0; j < M; j++) {
      const p = ring(0.985, (j / M) * Math.PI * 2);
      fan.push(p.x, p.y, p.z);
    }
    const faces: number[] = [];
    for (let j = 0; j < M; j++) faces.push(0, 1 + j, 1 + ((j + 1) % M));
    hole.setAttribute("position", new THREE.Float32BufferAttribute(fan, 3));
    hole.setIndex(faces);
    hole.computeVertexNormals();
    kettle.add(new THREE.Mesh(hole, new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide })));
  }

  // Dasta: yassi po'lat tasma, qora qoplama; ichki tomoni biroz botiq
  {
    const half = HANDLE.map(([x, row]) => new THREE.Vector3(R(x), Y(row), 0));
    const left = half.slice(1).reverse().map((p) => new THREE.Vector3(-p.x, p.y, 0));
    const curve = new THREE.CatmullRomCurve3([...left, ...half], false, "centripetal");
    const T = 0.115;
    const D = 0.185;
    const C = 0.05;
    const section: number[][] = [];
    const steps = 5;
    for (let k = 0; k < 4; k++) {
      const su = [1, -1, -1, 1][k];
      const sw = [1, 1, -1, -1][k];
      for (let s = 0; s <= steps; s++) {
        const a = (k * Math.PI) / 2 + (s / steps) * (Math.PI / 2);
        section.push([su * (T - C) + Math.cos(a) * C, sw * (D - C) + Math.sin(a) * C]);
      }
      if (k === 1) section.push([-T + 0.05, 0]); // ichki ariqcha
    }
    const N = 260;
    const M = section.length;
    const positions: number[] = [];
    const index: number[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const n = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      for (const [u, w] of section) positions.push(p.x + n.x * u, p.y + n.y * u, w);
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
    kettle.add(new THREE.Mesh(geometry, handleMat));

    // Quloqchalar va parchinlar (parchin o'qi — jo'mrak yo'nalishida)
    for (const sign of [-1, 1]) {
      const shape = new THREE.Shape();
      LUG.forEach(([r, row], i) => {
        const x = sign * R(r);
        if (i === 0) shape.moveTo(x, Y(row));
        else shape.lineTo(x, Y(row));
      });
      shape.closePath();
      const lug = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }),
        shell,
      );
      lug.position.z = -0.3;
      kettle.add(lug);
      // Tashqi plastinka: pastdan to'g'ri, parchin atrofida dumaloq
      const plate = new THREE.Shape();
      plate.moveTo(-0.32, Y(592));
      plate.lineTo(-0.32, Y(PIVOT[1]));
      plate.absarc(0, Y(PIVOT[1]), 0.32, Math.PI, 0, true);
      plate.lineTo(0.32, Y(592));
      plate.closePath();
      const shield = new THREE.Mesh(
        new THREE.ExtrudeGeometry(plate, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 20 }),
        shell,
      );
      shield.rotation.y = Math.PI / 2;
      shield.position.x = sign * R(PIVOT[0]) + (sign > 0 ? 0.04 : -0.09);
      kettle.add(shield);
      const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.3, 24), steel);
      rivet.rotation.z = Math.PI / 2;
      rivet.position.set(sign * R(PIVOT[0]), Y(PIVOT[1]), 0);
      kettle.add(rivet);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 28, 18), steel);
      head.scale.x = 0.42;
      head.position.set(sign * (R(PIVOT[0]) + 0.13), Y(PIVOT[1]), 0);
      kettle.add(head);
    }
  }

  const camera = new THREE.PerspectiveCamera(15, 1, 1, 200);
  const distance = 41;
  const targetY = Y(592);
  camera.position.set(0, targetY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
  camera.lookAt(0, targetY, 0);
  camera.setViewOffset(RENDER, RENDER, CROP.x, CROP.y, CROP.width, CROP.height);

  return {
    width: CROP.width,
    height: CROP.height,
    scene,
    camera,
    turn: (degrees: number) => {
      kettle.rotation.y = (degrees * Math.PI) / 180;
    },
  };
}
