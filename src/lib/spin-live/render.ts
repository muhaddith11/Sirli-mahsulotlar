import * as THREE from "three";
import { createCasserole } from "./casserole";
import { createElectricKettle } from "./electric";
import { createKettle } from "./kettle";
import { createLayers } from "./layers";
import { createPot } from "./pot";
import type { LiveModel } from "./registry";
import { createStack } from "./stack";
import { createTeapot } from "./teapot";
import { createDomeKettle, createFlutedKettle } from "./whistle";

/** Real vaqtda chiziladigan aylanish: istalgan burchakda, sakrashsiz */
export type LiveSpin = {
  /** Ko'rinish nisbati (kadrlar bilan bir xil) */
  width: number;
  height: number;
  /** degrees burchakda chizib, natijani ctx'ning (x, y, w, h) joyiga ko'chiradi; quality — chizish o'lchami ulushi */
  draw: (ctx: CanvasRenderingContext2D, degrees: number, x: number, y: number, w: number, h: number, quality?: number) => void;
};

type Built = { width: number; height: number; scene: THREE.Scene; camera: THREE.Camera; turn: (degrees: number) => void };

/** Emal choynaklar bitta qolipdan: farqi faqat rang va naqshda */
const CREAM = "#f4ece0";

export const BUILDERS: Record<LiveModel["kind"], (renderer: THREE.WebGLRenderer, base: string) => Promise<Built>> = {
  teapot: createTeapot,
  kulgich: (renderer, base) => createKettle(renderer, base, { color: "#f0bc00", print: "mask" }),
  pion: (renderer, base) => createKettle(renderer, base, { color: CREAM, print: "photo" }),
  natyurmort: (renderer, base) => createKettle(renderer, base, { color: CREAM, print: "photo", knob: 90 }),
  hoxloma: (renderer, base) => createKettle(renderer, base, { color: "#0c0c0e", print: "photo", lid: "#303034", height: 0.925, roughness: 0.14 }),
  sepkil: createPot,
  gornitsa: createCasserole,
  fluted: createFlutedKettle,
  dome: createDomeKettle,
  electric: createElectricKettle,
  stack: createStack,
  layers: (_renderer, base) => createLayers(base),
};

/**
 * Hamma mahsulot bitta WebGL kontekstida chiziladi (brauzer kontekstlar sonini cheklaydi),
 * keyin har birining 2D canvas'iga ko'chiriladi — agrumeafarm.it'dagi kabi.
 */
let shared: { renderer: THREE.WebGLRenderer; lost: Set<() => void> } | null = null;
const models = new Map<string, Promise<Built>>();

function context() {
  if (shared) return shared;
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const lost = new Set<() => void>();
  canvas.addEventListener("webglcontextlost", () => {
    // Kontekst yo'qolsa (xotira tanqisligi) — hamma oddiy kadrlarga qaytadi
    shared = null;
    models.clear();
    for (const listener of lost) listener();
  });
  shared = { renderer, lost };
  return shared;
}

export async function loadLiveSpin(model: LiveModel, onLost: () => void): Promise<{ spin: LiveSpin; release: () => void }> {
  const { renderer, lost } = context();
  const cacheKey = model.kind + model.base;
  let built = models.get(cacheKey);
  if (!built) {
    built = BUILDERS[model.kind](renderer, model.base);
    models.set(cacheKey, built);
    built.catch(() => models.delete(cacheKey));
  }
  const { width, height, scene, camera, turn } = await built;
  lost.add(onLost);

  const spin: LiveSpin = {
    width,
    height,
    draw: (ctx, degrees, x, y, w, h, quality = 1) => {
      const W = Math.max(1, Math.round(w * quality));
      const H = Math.max(1, Math.round(h * quality));
      const canvas = renderer.domElement;
      // Bufer faqat kattalashadi: har mahsulot uchun qayta o'lchash qimmat
      if (canvas.width < W || canvas.height < H) renderer.setSize(Math.max(canvas.width, W), Math.max(canvas.height, H), false);
      renderer.setViewport(0, 0, W, H);
      turn(degrees);
      renderer.render(scene, camera);
      // WebGL'da (0,0) — pastki chap burchak
      ctx.drawImage(canvas, 0, canvas.height - H, W, H, x, y, w, h);
    },
  };
  return { spin, release: () => lost.delete(onLost) };
}
