import * as THREE from "three";
import { fromAbove, lathe, sweep } from "./lathe";
import { addStudio } from "./studio";

/**
 * "Sepkil" kastryulkasining 3D modeli — egasining rasmlaridan o'lchangan.
 * O'lchamlar rasm pikselida (100px = 1 birlik): [radius, tagidan balandlik].
 * Sepkillar speckle.webp'da: takrorlanadigan oq-qora niqob, emal rangiga ko'paytiriladi.
 */

const ELEVATION = (21 * Math.PI) / 180;
const R = (px: number) => px / 100;

/** Kadrlar shu sahnadan shu to'rtburchak bo'yicha qirqiladi */
const RENDER = 1080;
const CROP = { x: 144, y: 266, width: 791, height: 587 };

const PEACH = "#ecc09a";
/** Tik devorga yorug'lik kam tushadi: rasmlarda ham devor qopqoqdan to'qroq */
const WALL = "#cf9c74";
/** Niqobning bir takrori necha birlikni qoplaydi */
const TILE = 6;

/** Tana: tagi yumaloq, devori tepaga qarab biroz kengayadi */
const BODY = [[0, 8], [165, 8], [188, 2], [205, 0], [222, 8], [236, 26], [243, 55], [246, 100], [248, 190], [252, 280], [256, 345], [258, 364]];
/** Qopqoq: tashqi buklangan lab, botiq halqa, past gumbaz */
const LID = [[258, 362], [272, 356], [285, 362], [289, 374], [284, 386], [270, 391], [254, 390], [243, 387], [236, 391], [230, 401], [201, 413], [150, 427], [100, 436], [50, 440], [0, 441]];
/** Tutqich halqasi: [x, y] — kamera tomonga qaragan yoy o'qi */
const KNOB = [[-42, 435], [-42, 463], [-30, 486], [0, 494], [30, 486], [42, 463], [42, 435]];
/** Dasta: yon tomondan chiqqan yotiq uzangi; [o'qdan, yon tomonga, balandlik], yarmi */
const GRIP = [[222, 132, 282], [262, 134, 278], [312, 128, 268], [338, 104, 260], [348, 60, 254], [350, 0, 252]];

export async function createPot(renderer: THREE.WebGLRenderer, base: string) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer, { fill: false });

  const map = await new THREE.TextureLoader().loadAsync(base + "speckle.webp");
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;

  const enamel = new THREE.MeshPhysicalMaterial({ color: PEACH, map, roughness: 0.4, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.3 });
  const wall = enamel.clone();
  wall.color.set(WALL);

  const pot = new THREE.Group();
  scene.add(pot);

  // Devor atrofiga butun son takror sig'ishi kerak, aks holda chok ko'rinadi
  pot.add(lathe(BODY, wall, (u, s) => [u * 3, s / TILE]));
  pot.add(lathe(LID, enamel, fromAbove(TILE)));

  // Qopqoq tutqichi
  const arch = new THREE.CatmullRomCurve3(KNOB.map(([x, h]) => new THREE.Vector3(R(x), R(h), 0)));
  pot.add(sweep(arch, () => [0.14, 0.11], enamel, { tile: TILE, flatSide: new THREE.Vector3(0, 0, 1) }));

  // Dastalar: bir-biriga qarama-qarshi
  for (const sign of [-1, 1]) {
    const half = GRIP.map(([x, z, h]) => new THREE.Vector3(sign * R(x), R(h), R(z)));
    const other = half.slice(0, -1).reverse().map((p) => new THREE.Vector3(p.x, p.y, -p.z));
    const curve = new THREE.CatmullRomCurve3([...half, ...other], false, "centripetal");
    pot.add(sweep(curve, () => [0.26, 0.17], enamel, { tile: TILE }));
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
