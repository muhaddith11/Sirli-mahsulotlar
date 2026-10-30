import * as THREE from "three";
import { decal, lathe, plain, planeCurve, radiusAt, sweep } from "./lathe";
import { addStudio, metalEnvironment } from "./studio";

/**
 * "Emerald" elektr choynagi — egasining rasmlaridan o'lchangan.
 * O'lchamlar rasm pikselida (100px = 1 birlik): [radius, tagidan balandlik]; dasta tekisligida [x, balandlik].
 * Jo'mrak +X tomonda; 0° da chapga qaraydi, oyna va yozuv old tomonda — asosiy rasmdagidek.
 */

const ELEVATION = (14 * Math.PI) / 180;
const RENDER = 1080;
const CROP = { x: 161, y: 130, width: 757, height: 827 };

const CREAM = "#e2dccb";

const STAND = [[0, 2], [172, 2], [184, 10], [188, 34], [184, 62], [172, 78], [158, 84]];
const SHELL_LOW = [[150, 84], [186, 92], [198, 110], [202, 138]];
const SHELL = [[202, 138], [203, 300], [203, 500]];
const SHELL_TOP = [[203, 500], [200, 530], [188, 548], [176, 553]];
const NECK = [[178, 552], [181, 560], [181, 690], [178, 700]];
const LID = [[176, 700], [186, 704], [190, 712], [188, 722], [176, 728], [150, 730], [0, 730]];
const HANDLE = [[-176, 692], [-263, 696], [-308, 680], [-328, 620], [-325, 460], [-316, 380], [-288, 322], [-240, 298], [-180, 300]];
const RIBS = 60;

/** Bo'yiga ketgan qovurg'alar: geometriya emas, bump xarita — atrofi 60 ta, kesimi og'ir bo'lmasin */
function ribTexture() {
  const width = 32;
  const height = 64;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const fade = Math.min(1, Math.min(y, height - 1 - y) / 6);
    for (let x = 0; x < width; x++) {
      const v = Math.abs(Math.cos((x / width) * Math.PI)) ** 0.7 * fade;
      const i = (y * width + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = Math.round(v * 255);
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(RIBS, 1);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export async function createElectricKettle(renderer: THREE.WebGLRenderer, base: string) {
  const scene = new THREE.Scene();
  addStudio(scene, renderer, { fill: false, back: true });

  const loader = new THREE.TextureLoader();
  const [panel, text] = await Promise.all([loader.loadAsync(base + "panel.webp"), loader.loadAsync(base + "text.webp")]);
  panel.colorSpace = THREE.SRGBColorSpace;
  panel.anisotropy = 8;

  const shell = new THREE.MeshPhysicalMaterial({ color: CREAM, roughness: 0.38, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.1, envMapIntensity: 1 });
  const ribbed = shell.clone();
  ribbed.bumpMap = ribTexture();
  ribbed.bumpScale = 3;
  const metal = metalEnvironment(renderer);
  const steel = new THREE.MeshStandardMaterial({ color: 0xe4e6e9, roughness: 0.26, metalness: 1, envMap: metal, envMapIntensity: 1 });
  const copper = new THREE.MeshStandardMaterial({ color: "#d09454", roughness: 0.3, metalness: 1, envMap: metal, envMapIntensity: 1 });

  const kettle = new THREE.Group();
  scene.add(kettle);

  kettle.add(lathe(STAND, shell, plain));
  kettle.add(lathe(SHELL_LOW, shell, plain));
  kettle.add(lathe(SHELL, ribbed, (u, _s, _t, y) => [u, (y - 1.38) / (5 - 1.38)], 2));
  kettle.add(lathe(SHELL_TOP, shell, plain));
  kettle.add(lathe(NECK, steel, plain));
  kettle.add(lathe(LID, shell, plain));

  // Qopqoqdagi mis tugma
  {
    const R = 0.42;
    const half = 0.36;
    const shape = new THREE.Shape();
    shape.moveTo(-R, -half);
    shape.lineTo(-R, half);
    shape.absarc(0, half, R, Math.PI, 0, true);
    shape.lineTo(R, -half);
    shape.absarc(0, -half, R, 0, Math.PI, true);
    const button = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 16 }), copper);
    button.rotation.x = -Math.PI / 2;
    button.rotation.z = Math.PI / 2;
    button.position.y = 7.3;
    kettle.add(button);
  }

  // Jo'mrak: bo'yindan chiqqan po'lat tumshuq
  {
    const N = 24;
    const M = 12;
    const positions: number[] = [];
    const index: number[] = [];
    for (let i = 0; i <= N; i++) {
      const p = (i / N) * 2 - 1;
      const a = p * (Math.PI / 4);
      const low = 6 + 0.95 * Math.abs(p) ** 1.2;
      const bottom = new THREE.Vector3(1.8 * Math.cos(a), low, 1.8 * Math.sin(a));
      const top = new THREE.Vector3(
        THREE.MathUtils.lerp(2.47, 1.8 * Math.SQRT1_2, Math.abs(p) ** 1.3),
        THREE.MathUtils.lerp(6.9, 6.96, Math.abs(p)),
        (1.8 * Math.SQRT1_2 * Math.sign(p) || 0) * Math.abs(p) ** 1.3,
      );
      for (let j = 0; j <= M; j++) {
        const q = bottom.clone().lerp(top, j / M);
        positions.push(q.x, q.y, q.z);
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
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    const lip = steel.clone();
    lip.side = THREE.DoubleSide;
    kettle.add(new THREE.Mesh(geometry, lip));
  }

  // Dasta: katta "D", tepada keng, pastga torayadi; tana bo'ylab ustun
  const flat = new THREE.Vector3(0, 0, 1);
  kettle.add(sweep(planeCurve(HANDLE), (t) => [THREE.MathUtils.lerp(0.68, 0.46, t), 0.3], shell, { flatSide: flat }));
  kettle.add(sweep(planeCurve([[-206, 130], [-208, 300], [-206, 530]]), () => [0.46, 0.08], shell, { flatSide: flat }));

  // Old oyna va yozuv
  const radius = radiusAt(SHELL);
  kettle.add(decal(radius, [Math.PI - 0.38, Math.PI + 0.38], [1.45, 4.05], new THREE.MeshPhysicalMaterial({ map: panel, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1 }), 0.02));
  kettle.add(decal(radiusAt(NECK), [Math.PI - 0.42, Math.PI + 0.42], [6, 6.42], new THREE.MeshBasicMaterial({ color: 0x17181a, alphaMap: text, transparent: true, depthWrite: false })));

  const camera = new THREE.PerspectiveCamera(15, 1, 1, 200);
  const distance = 41;
  const targetY = 3.65;
  camera.position.set(0, targetY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
  camera.lookAt(0, targetY, 0);
  camera.setViewOffset(RENDER, RENDER, CROP.x, CROP.y, CROP.width, CROP.height);

  return {
    width: CROP.width,
    height: CROP.height,
    scene,
    camera,
    turn: (degrees: number) => {
      kettle.rotation.y = Math.PI + (degrees * Math.PI) / 180;
    },
  };
}
