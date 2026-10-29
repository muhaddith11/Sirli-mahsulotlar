import * as THREE from "three";

/**
 * Demo mahsulot: shakl, qopqoq va dastalar joyida turadi, naqsh qatlami silindr bo'ylab aylanadi
 * (agrumeafarm.it'dagi banka yorlig'i kabi). Kadrlar aynan shu usulda chizilgan — burchaklar mos.
 */

type LayerFile = { src: string; pattern?: { cx: number[]; r: number[] } };
type ModelFile = { width: number; height: number; layers: LayerFile[] };

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/** Oldindan ko'paytirilgan alfa bilan (premultiplied) — chetlar xiralashmaydi */
const STATIC = /* glsl */ `
uniform sampler2D map;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(map, vUv);
}`;

/**
 * Naqsh: har qatorda silindr o'qi (cx) va radiusi (r). Ekrandagi nuqta burchagi asin bilan topiladi,
 * aylanish burchagi ayiriladi va tekis naqshdan rang olinadi. Siluet (alfa) joyida qoladi.
 * Rasm: tepada rang, pastda alfa (kulrang).
 */
const PATTERN = /* glsl */ `
uniform sampler2D map;
uniform sampler2D rows;
uniform float phi;
uniform float width;
varying vec2 vUv;
const float PI = 3.141592653589793;
void main() {
  float y = 1.0 - vUv.y;
  float alpha = texture2D(map, vec2(vUv.x, 0.5 - y * 0.5)).r;
  if (alpha <= 0.0) discard;
  vec2 axis = texture2D(rows, vec2(y, 0.5)).rg;
  float x = vUv.x * width;
  float theta = asin(clamp((x - axis.x) / max(axis.y, 1.0), -1.0, 1.0));
  float u = mod(theta - phi + PI, 2.0 * PI) - PI;
  if (abs(u) > PI * 0.5) u -= PI * sign(u);
  float source = (axis.x + axis.y * sin(u)) / width;
  // Mip darajasi silliq koordinatadan: naqsh "buklangan" chiziqda xira chiziq qolmasin
  vec2 gx = vec2(dFdx(vUv.x), dFdx(vUv.y) * 0.5);
  vec2 gy = vec2(dFdy(vUv.x), dFdy(vUv.y) * 0.5);
  vec3 color = textureGrad(map, vec2(source, 1.0 - y * 0.5), gx, gy).rgb;
  gl_FragColor = vec4(color * alpha, alpha);
}`;

export async function createLayers(base: string) {
  const model: ModelFile = await (await fetch(base + "model.json")).json();
  const loader = new THREE.TextureLoader();
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const angles: THREE.IUniform<number>[] = [];

  const textures = await Promise.all(model.layers.map((layer) => loader.loadAsync(base + layer.src)));
  model.layers.forEach((layer, order) => {
    const map = textures[order];
    const uniforms: Record<string, THREE.IUniform> = { map: { value: map } };
    if (layer.pattern) {
      const { cx, r } = layer.pattern;
      const data = new Float32Array(cx.length * 4);
      cx.forEach((value, i) => {
        data[i * 4] = value;
        data[i * 4 + 1] = r[i];
      });
      const rows = new THREE.DataTexture(data, cx.length, 1, THREE.RGBAFormat, THREE.FloatType);
      rows.needsUpdate = true;
      const phi = { value: 0 };
      angles.push(phi);
      Object.assign(uniforms, { rows: { value: rows }, phi, width: { value: model.width } });
    } else {
      // Shaffof chetlar to'g'ri aralashsin
      map.premultiplyAlpha = true;
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX,
      fragmentShader: layer.pattern ? PATTERN : STATIC,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = order;
    scene.add(mesh);
  });

  return {
    width: model.width,
    height: model.height,
    scene,
    camera,
    turn: (degrees: number) => {
      for (const phi of angles) phi.value = (degrees * Math.PI) / 180;
    },
  };
}
