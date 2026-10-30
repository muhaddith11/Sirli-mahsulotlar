import * as THREE from "three";
import { decal, fromAbove, lathe, plain, planeCurve, radiusAt, sweep } from "./lathe";
import { addStudio, metalEnvironment } from "./studio";

/**
 * Hushtakli choynaklar: "Gornitsa" (tarnovli, yog'och dastali) va "Zepter" (gumbazli, marmar chiziqli).
 * O'lchamlar rasm pikselida (100px = 1 birlik): [radius, tagidan balandlik]; dasta va hushtak tekisligida [x, balandlik].
 * Hushtak +X tomonda; 0° da chapga qaraydi — egasining asosiy rasmidagidek, yozuv old tomonda.
 */

const RENDER = 1080;
const ELEVATION = (16 * Math.PI) / 180;

/** Xrom hushtak: tanadan chiqqan quvur va uchidagi dumaloq qalpoq */
function addWhistle(group: THREE.Group, steel: THREE.Material, from: number[], to: number[]) {
  const a = new THREE.Vector3(from[0] / 100, from[1] / 100, 0);
  const b = new THREE.Vector3(to[0] / 100, to[1] / 100, 0);
  const d = b.clone().sub(a).normalize();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, a.distanceTo(b), 32, 1, true), steel);
  tube.position.copy(a).add(b).multiplyScalar(0.5);
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  group.add(tube);
  // Qalpoq: quvur o'qi bo'ylab aylanish jismi, uchida teshik
  const cap = lathe([[0, -2], [24, -2], [36, 8], [38, 24], [30, 38], [14, 44], [9, 40], [0, 38]], steel, plain, 6, { segments: 48 });
  cap.position.copy(b);
  cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  group.add(cap);
}

function camera(targetY: number, crop: { x: number; y: number; width: number; height: number }) {
  const view = new THREE.PerspectiveCamera(15, 1, 1, 200);
  const distance = 41;
  view.position.set(0, targetY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
  view.lookAt(0, targetY, 0);
  view.setViewOffset(RENDER, RENDER, crop.x, crop.y, crop.width, crop.height);
  return view;
}

const chrome = (renderer: THREE.WebGLRenderer) =>
  new THREE.MeshStandardMaterial({ color: 0xf2f3f6, roughness: 0.07, metalness: 1, envMap: metalEnvironment(renderer), envMapIntensity: 1 });

/* "Gornitsa": qo'ng'iroqsimon tana, atrofi bo'ylab tarnovlar */
const FLUTED_CROP = { x: 185, y: 110, width: 709, height: 896 };
const FLUTED_BAND = [[0, 2], [250, 2], [264, 8], [272, 18], [275, 26]];
const FLUTED_BODY = [[275, 26], [278, 56], [278, 84], [274, 115], [264, 175], [252, 234], [234, 293], [208, 352], [174, 411], [150, 445], [140, 455]];
const FLUTED_RIM = [[134, 446], [146, 451], [147, 462], [139, 471], [126, 473], [116, 468]];
const FLUTED_LID = [[118, 463], [90, 478], [50, 488], [0, 490]];
const FLUTED_KNOB = [[-104, 472], [-92, 505], [-52, 528], [0, 536], [52, 528], [92, 505], [104, 472]];
const FLUTED_STRUT = [[172, 418], [198, 466], [190, 515], [168, 578], [150, 640], [146, 700]];
const FLUTED_HANDLE = [[176, 740], [108, 733], [18, 722], [-62, 685], [-132, 622], [-192, 548], [-232, 464]];
const FLUTED_FERRULE = [[-166, 412], [-200, 444], [-232, 482]];
const FLUTES = 18;
const FLUTE_LOW = 1.0;
const FLUTE_HIGH = 3.85;

const ease = (x: number) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

/** Tarnov: bo'yiga cho'zilgan, ikki uchi dumaloq botiq */
function flute(angle: number, y: number) {
  const pulse = 0.5 + 0.5 * Math.cos(FLUTES * angle);
  const tip = Math.max(0, (FLUTE_LOW + 0.42 - y) / 0.42, (y - (FLUTE_HIGH - 0.42)) / 0.42);
  return -0.1 * ease((pulse - 0.2 - tip) / 0.4);
}

export async function createFlutedKettle(renderer: THREE.WebGLRenderer, base: string) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer, { fill: false, back: true });

  const loader = new THREE.TextureLoader();
  const [speckle, wood, text] = await Promise.all([loader.loadAsync(base + "speckle.webp"), loader.loadAsync(base + "wood.webp"), loader.loadAsync(base + "text.webp")]);
  speckle.colorSpace = THREE.SRGBColorSpace;
  speckle.wrapS = speckle.wrapT = THREE.RepeatWrapping;
  speckle.anisotropy = 8;
  wood.colorSpace = THREE.SRGBColorSpace;
  wood.wrapS = wood.wrapT = THREE.MirroredRepeatWrapping;
  wood.anisotropy = 8;

  const TILE = 5;
  const enamel = new THREE.MeshPhysicalMaterial({ color: "#e4e4dc", map: speckle, roughness: 0.46, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.2, envMapIntensity: 1 });
  const steel = chrome(renderer);
  const woodMat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: wood, roughness: 0.42, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.25, envMapIntensity: 0.9 });

  const kettle = new THREE.Group();
  scene.add(kettle);

  kettle.add(lathe(FLUTED_BAND, steel, plain));
  kettle.add(lathe(FLUTED_BODY, enamel, (u, s) => [u * 4, s / TILE], 8, { segments: 216, relief: flute }));
  kettle.add(lathe(FLUTED_RIM, steel, plain));
  kettle.add(lathe(FLUTED_LID, steel, plain));

  const flat = new THREE.Vector3(0, 0, 1);
  kettle.add(sweep(planeCurve(FLUTED_KNOB), () => [0.17, 0.075], woodMat, { tile: 3, flatSide: flat }));
  // Old xrom ustun: pastda ingichka, dasta tagida keng
  kettle.add(sweep(planeCurve(FLUTED_STRUT), (t) => [THREE.MathUtils.lerp(0.26, 0.46, t), THREE.MathUtils.lerp(0.13, 0.3, t)], steel, { flatSide: flat }));
  kettle.add(sweep(planeCurve(FLUTED_HANDLE), (t) => [THREE.MathUtils.lerp(0.44, 0.34, t), THREE.MathUtils.lerp(0.36, 0.3, t)], woodMat, { tile: 3, flatSide: flat }));
  kettle.add(sweep(planeCurve(FLUTED_FERRULE), () => [0.34, 0.22], steel, { flatSide: flat }));
  // Hushtak qopqog'ini ochadigan yog'och tugma va sim
  const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.5), woodMat);
  thumb.position.set(1.3, 7.58, 0);
  thumb.rotation.z = -0.3;
  kettle.add(thumb);
  kettle.add(sweep(planeCurve([[296, 472], [262, 520], [214, 552], [190, 548]]), () => [0.05, 0.02], steel, { flatSide: flat }));

  addWhistle(kettle, steel, [160, 368], [292, 448]);

  const label = new THREE.MeshBasicMaterial({ color: 0x5b4a3a, alphaMap: text, transparent: true, depthWrite: false });
  const front = decal(radiusAt(FLUTED_BODY), [Math.PI - 0.4, Math.PI + 0.4], [0.28, 0.5], label);
  kettle.add(front);

  return {
    width: FLUTED_CROP.width,
    height: FLUTED_CROP.height,
    scene,
    camera: camera(3.8, FLUTED_CROP),
    turn: (degrees: number) => {
      kettle.rotation.y = Math.PI + (degrees * Math.PI) / 180;
    },
  };
}

/* "Zepter": gumbaz tana marmar chiziqli, pastda xrom taglik */
const DOME_CROP = { x: 167, y: 114, width: 744, height: 886 };
const DOME_BASE = [[0, 3], [235, 3], [252, 8], [262, 35], [263, 70], [260, 124], [252, 183], [245, 205]];
const DOME_BODY = [[246, 205], [248, 213], [249, 272], [247, 331], [235, 390], [211, 450], [167, 509], [133, 539], [112, 552]];
const DOME_CAP = [[112, 550], [117, 556], [110, 566], [88, 578], [40, 592], [0, 596]];
const DOME_KNOB = [[-82, 584], [-72, 618], [-40, 642], [0, 650], [40, 642], [72, 618], [82, 584]];
const DOME_FRAME = [[160, 462], [218, 515], [238, 579], [221, 653], [183, 700], [148, 727]];
const DOME_REAR = [[-132, 685], [-167, 653], [-192, 589], [-187, 526], [-140, 466]];
const DOME_GRIP = [[156, 722], [80, 748], [13, 753], [-60, 730], [-140, 680]];
const DOME_LEVER = [[272, 474], [254, 510], [238, 558], [193, 610], [143, 621], [80, 590]];

export async function createDomeKettle(renderer: THREE.WebGLRenderer, base: string) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer, { fill: false, back: true });

  const loader = new THREE.TextureLoader();
  const [map, text] = await Promise.all([loader.loadAsync(base + "body.webp"), loader.loadAsync(base + "text.webp")]);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const y0 = 2.05;
  const y1 = 5.52;
  const enamel = new THREE.MeshPhysicalMaterial({ color: "#ffffff", map, roughness: 0.4, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2 });
  const steel = chrome(renderer);
  const cream = new THREE.MeshPhysicalMaterial({ color: "#efe4cd", roughness: 0.55, metalness: 0, clearcoat: 0.2, envMapIntensity: 0.8 });

  const kettle = new THREE.Group();
  scene.add(kettle);

  kettle.add(lathe(DOME_BASE, steel, plain));
  const body = lathe(DOME_BODY, enamel, (u, _s, _t, y) => [u, (y - y0) / (y1 - y0)], 8);
  body.rotation.y = -Math.PI / 2;
  kettle.add(body);
  kettle.add(lathe(DOME_CAP, steel, fromAbove(6)));

  const flat = new THREE.Vector3(0, 0, 1);
  kettle.add(sweep(planeCurve(DOME_KNOB), () => [0.2, 0.09], cream, { flatSide: flat }));
  // Xrom dasta: yassi tasma; ustida krem tutqich
  kettle.add(sweep(planeCurve(DOME_FRAME), (t) => [THREE.MathUtils.lerp(0.32, 0.3, t), 0.14], steel, { flatSide: flat }));
  kettle.add(sweep(planeCurve(DOME_REAR), () => [0.3, 0.14], steel, { flatSide: flat }));
  kettle.add(sweep(planeCurve(DOME_GRIP), (t) => [0.4 + 0.06 * Math.sin(t * Math.PI), 0.27 + 0.1 * Math.sin(t * Math.PI)], cream, { flatSide: flat }));
  kettle.add(sweep(planeCurve(DOME_LEVER), (t) => [0.08 + 0.1 * t, 0.035], steel, { flatSide: flat }));

  addWhistle(kettle, steel, [182, 398], [310, 448]);

  const label = new THREE.MeshBasicMaterial({ color: 0x23211f, alphaMap: text, transparent: true, depthWrite: false });
  kettle.add(decal(radiusAt(DOME_BASE), [Math.PI - 0.32, Math.PI + 0.32], [0.86, 1.3], label));

  return {
    width: DOME_CROP.width,
    height: DOME_CROP.height,
    scene,
    camera: camera(3.8, DOME_CROP),
    turn: (degrees: number) => {
      kettle.rotation.y = Math.PI + (degrees * Math.PI) / 180;
    },
  };
}
