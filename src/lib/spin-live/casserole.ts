import * as THREE from "three";
import { lathe, plain } from "./lathe";
import { addStudio } from "./studio";

/**
 * "Gornitsa" qozonining 3D modeli — egasining rasmlaridan o'lchangan.
 * O'lchamlar rasm pikselida (100px = 1 birlik): [radius, tagidan balandlik].
 * Granit sepkillar speckle.webp'da (takrorlanadi), qopqoqdagi yozuv lid-text.webp'da.
 */

const ELEVATION = (16 * Math.PI) / 180;
const R = (px: number) => px / 100;

/** Kadrlar shu sahnadan shu to'rtburchak bo'yicha qirqiladi */
const RENDER = 1080;
const CROP = { x: 93, y: 260, width: 893, height: 564 };

/** Niqobning bir takrori necha birlikni qoplaydi */
const TILE = 5;

/** Kosa: tagi kichik va tekis, devori yumaloq */
const BOWL = [[0, 6], [110, 6], [130, 0], [170, 7], [206, 27], [232, 59], [244, 89], [267, 127], [284, 164], [299, 202], [312, 239], [321, 277], [330, 292], [336, 298]];
/** Gardish: kosadan chiqib, shisha qopqoq o'tiradigan zinagacha */
const RIM = [[336, 298], [342, 301], [346, 312], [346, 326], [341, 334], [333, 336], [328, 331]];
/** Ichki devor (shisha ostidan ko'rinadi) */
const INNER = [[328, 331], [318, 310], [300, 262], [268, 190], [226, 110], [160, 44], [100, 30], [0, 28]];
/** Qopqoq: po'lat halqa va shisha gumbaz */
const RING = [[324, 328], [330, 332], [331, 338], [327, 343], [320, 344], [315, 340]];
const GLASS = [[319, 341], [285, 366], [225, 386], [150, 399], [60, 405], [0, 406]];
/** Po'lat tutqich: keng asos, ingichka bo'yin, yassi qalpoq */
const KNOB = [[0, 404], [84, 404], [80, 410], [52, 420], [34, 434], [27, 452], [30, 468], [44, 480], [61, 486], [64, 490], [60, 495], [30, 497], [0, 497]];
/** Quloq (tepadan qaraganda): [o'qdan, yon tomonga] */
const EAR = [[296, -172], [340, -170], [385, -140], [412, -90], [423, -30], [425, 0], [423, 30], [412, 90], [385, 140], [340, 170], [296, 172], [338, 0]];
const EAR_HOLE = [[360, -105], [378, -92], [392, -60], [398, -20], [399, 0], [398, 20], [392, 60], [378, 92], [360, 105], [350, 70], [346, 0], [350, -70]];

/** Shisha gumbaz balandligi: radius bo'yicha (yozuv sirtga yopishishi uchun) */
function domeHeight(radius: number) {
  const curve = new THREE.SplineCurve(GLASS.map(([r, h]) => new THREE.Vector2(R(r), R(h))));
  const points = curve.getPoints(120);
  for (let i = 1; i < points.length; i++) {
    if (radius >= points[i].x) {
      const a = points[i - 1];
      const b = points[i];
      return THREE.MathUtils.lerp(b.y, a.y, (radius - b.x) / Math.max(1e-5, a.x - b.x));
    }
  }
  return points[points.length - 1].y;
}

export async function createCasserole(renderer: THREE.WebGLRenderer, base: string) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer, { fill: false, back: true });

  const loader = new THREE.TextureLoader();
  const [map, text] = await Promise.all([loader.loadAsync(base + "speckle.webp"), loader.loadAsync(base + "lid-text.webp")]);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  text.anisotropy = 8;

  const granite = new THREE.MeshPhysicalMaterial({ color: "#ffffff", map, roughness: 0.42, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.3, envMapIntensity: 0.9 });
  // Ichkariga yorug'lik kam tushadi
  const inside = new THREE.MeshPhysicalMaterial({ color: "#3c3c3c", map, roughness: 0.5, metalness: 0, envMapIntensity: 0.45, side: THREE.DoubleSide });
  const steel = new THREE.MeshStandardMaterial({ color: 0xf2f3f6, roughness: 0.08, metalness: 1, envMapIntensity: 1.6 });
  // Shisha: biroz qoraytiradi va ustiga aks beradi; bo'shliq orqali orqa fon ko'rinadi
  const tint = new THREE.MeshBasicMaterial({ color: 0x0b0d10, transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide });
  const shine = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.05, metalness: 0, envMapIntensity: 0.8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });

  const pot = new THREE.Group();
  scene.add(pot);

  // Devor atrofiga butun son takror sig'ishi kerak, aks holda chok ko'rinadi
  const around = (u: number, s: number): [number, number] => [u * 4, s / TILE];
  pot.add(lathe(BOWL, granite, around));
  pot.add(lathe(RIM, granite, around));
  pot.add(lathe(INNER, inside, around));

  // Quloqlar: gardish bilan bir tekis, o'rtasi teshik
  for (const sign of [-1, 1]) {
    const outline = (points: number[][]) => new THREE.SplineCurve(points.map(([x, z]) => new THREE.Vector2(sign * R(x), R(z)))).getPoints(96);
    const shape = new THREE.Shape(outline(EAR));
    shape.holes.push(new THREE.Path(outline(EAR_HOLE)));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 });
    geometry.rotateX(Math.PI / 2);
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / TILE + 0.5, pos.getZ(i) / TILE + 0.5);
    const ear = new THREE.Mesh(geometry, granite);
    ear.position.y = R(336);
    pot.add(ear);
  }

  const lid = new THREE.Group();
  pot.add(lid);
  lid.add(lathe(RING, steel, plain));
  lid.add(lathe(GLASS, tint, plain, 6));
  lid.add(lathe(GLASS, shine, plain, 6));
  lid.add(lathe(KNOB, steel, plain));

  // Bug' teshigi
  const vent = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 12, 32), steel);
  vent.rotation.x = Math.PI / 2 + 0.16;
  vent.position.set(0, domeHeight(1.5) + 0.01, -1.5);
  lid.add(vent);

  // Yozuv shisha sirtiga yopishadi
  {
    const geometry = new THREE.PlaneGeometry(2.1, 0.56, 40, 12);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, 0, 1.95);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, domeHeight(Math.hypot(pos.getX(i), pos.getZ(i))) + 0.012);
    geometry.computeVertexNormals();
    lid.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xf2f2f0, alphaMap: text, transparent: true, depthWrite: false })));
  }

  const camera = new THREE.PerspectiveCamera(15, 1, 1, 200);
  const distance = 41;
  const targetY = R(235);
  camera.position.set(0, targetY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
  camera.lookAt(0, targetY, 0);
  camera.setViewOffset(RENDER, RENDER, CROP.x, CROP.y, CROP.width, CROP.height);

  return {
    width: CROP.width,
    height: CROP.height,
    scene,
    camera,
    turn: (degrees: number) => {
      pot.rotation.y = (degrees * Math.PI) / 180;
    },
  };
}
