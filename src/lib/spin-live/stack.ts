import * as THREE from "three";
import { decal, lathe, plain, radiusAt, sweep } from "./lathe";
import { addStudio, metalEnvironment } from "./studio";

/**
 * "Qo'ziqorin" to'plami: bir-biriga kiritilgan uchta kastryulka, eng tepadagisi shisha qopqoqli.
 * O'lchamlar rasm pikselida (100px = 1 birlik): [radius, tagidan balandlik].
 * Naqsh body.webp'da — uchala kastryulkada bir xil: u=0.25 — old, dastalar u=0 va u=0.5 da.
 */

const ELEVATION = (16 * Math.PI) / 180;
const RENDER = 1080;
const CROP = { x: 207, y: 14, width: 665, height: 979 };

const BODY = [[0, 9], [100, 9], [122, 2], [140, 6], [172, 32], [198, 78], [212, 127], [216, 173], [214, 221], [206, 265], [200, 289]];
const RIM = [[200, 288], [206, 302], [222, 312], [236, 318], [238, 324], [230, 328], [212, 322], [198, 310]];
const INNER = [[198, 310], [196, 282], [204, 216], [200, 140], [170, 65], [100, 32], [0, 28]];
/** Har keyingi kastryulka shuncha balandda turadi */
const STEP = 262;
const LID_RING = [[232, 320], [240, 324], [238, 332], [226, 336], [214, 332]];
const GLASS = [[220, 330], [170, 344], [100, 354], [0, 360]];
const LOOP = [[0, 362], [-30, 384], [-68, 432], [-62, 474], [-30, 496], [0, 500], [30, 496], [62, 474], [68, 432], [30, 384], [0, 362]];

export async function createStack(renderer: THREE.WebGLRenderer, base: string) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer, { fill: false, back: true });

  const map = await new THREE.TextureLoader().loadAsync(base + "body.webp");
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const y0 = 0;
  const y1 = 2.95;
  const enamel = new THREE.MeshPhysicalMaterial({ color: "#ffffff", map, roughness: 0.4, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.15 });
  const inside = new THREE.MeshPhysicalMaterial({ color: "#e4dcc8", roughness: 0.45, metalness: 0, envMapIntensity: 0.6, side: THREE.DoubleSide });
  const gold = new THREE.MeshStandardMaterial({ color: "#efc258", roughness: 0.12, metalness: 1, envMap: metalEnvironment(renderer), envMapIntensity: 1 });
  const tint = new THREE.MeshBasicMaterial({ color: 0x6f675a, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide });
  const shine = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.05, metalness: 0, envMapIntensity: 0.55, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });

  const metalPlate = gold.clone();
  metalPlate.side = THREE.DoubleSide;
  const wall = radiusAt(BODY.slice(4));

  const stack = new THREE.Group();
  scene.add(stack);

  const pot = (level: number) => {
    const group = new THREE.Group();
    group.position.y = (level * STEP) / 100;
    const body = lathe(BODY, enamel, (u, _s, _t, y) => [u, (y - y0) / (y1 - y0)], 6);
    body.rotation.y = -Math.PI / 2;
    group.add(body);
    group.add(lathe(RIM, gold, plain));
    group.add(lathe(INNER, inside, plain));

    // Dastalar: devordagi plastinka va tashqariga-yuqoriga chiqqan uzangi
    for (const sign of [-1, 1]) {
      const path: number[][] = [[196, -92, 162], [226, -96, 180], [298, -84, 228], [326, -44, 244], [330, 0, 246]];
      const half = path.map(([x, z, h]) => new THREE.Vector3((sign * x) / 100, h / 100, z / 100));
      const other = half.slice(0, -1).reverse().map((p) => new THREE.Vector3(p.x, p.y, -p.z));
      group.add(sweep(new THREE.CatmullRomCurve3([...half, ...other], false, "centripetal"), () => [0.14, 0.09], gold));
      const side = (sign * Math.PI) / 2;
      const plate = decal(wall, [side - 0.44, side + 0.44], [1.2, 2.04], metalPlate, 0.03);
      group.add(plate);
      for (const z of [-0.36, 0.36]) {
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), gold);
        rivet.scale.x = 0.55;
        rivet.position.set((sign * 218) / 100, 1.62, z);
        group.add(rivet);
      }
    }
    stack.add(group);
    return group;
  };

  pot(0);
  pot(1);
  const top = pot(2);

  // Shisha qopqoq va tilla halqa
  top.add(lathe(LID_RING, gold, plain));
  top.add(lathe(GLASS, tint, plain, 6));
  top.add(lathe(GLASS, shine, plain, 6));
  top.add(lathe([[0, 358], [34, 358], [28, 366], [12, 374], [8, 390], [14, 398], [6, 406], [0, 408]], gold, plain, 6, { segments: 32 }));
  const loop = new THREE.CatmullRomCurve3(LOOP.map(([x, h]) => new THREE.Vector3(x / 100, h / 100, 0)), false, "centripetal");
  top.add(sweep(loop, () => [0.075, 0.075], gold, { flatSide: new THREE.Vector3(0, 0, 1) }));

  const camera = new THREE.PerspectiveCamera(15, 1, 1, 200);
  const distance = 45;
  const targetY = 4.68;
  camera.position.set(0, targetY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
  camera.lookAt(0, targetY, 0);
  camera.setViewOffset(RENDER, RENDER, CROP.x, CROP.y, CROP.width, CROP.height);

  return {
    width: CROP.width,
    height: CROP.height,
    scene,
    camera,
    turn: (degrees: number) => {
      stack.rotation.y = (degrees * Math.PI) / 180;
    },
  };
}
