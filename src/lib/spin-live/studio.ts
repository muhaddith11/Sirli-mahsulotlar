import * as THREE from "three";

/** Fotostudiya: qorong'i xona va yorug' panellar (softbox) — yaltiroq emalda aniq aks beradi */
function studio(fill: boolean, back: boolean) {
  const room = 0.2;
  const env = new THREE.Scene();
  env.background = new THREE.Color(room, room * 0.96, room * 0.92);
  const panel = (w: number, h: number, power: number, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(power, power, power), side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(5, 16, 5, -13, 3, 8);
  panel(3, 14, 3, 13, 2, 6);
  panel(16, 6, 2.5, 0, 15, 3);
  if (fill) panel(12, 2.5, 1.2, 0, -3, 15);
  if (back) panel(20, 9, 1.5, 0, 7, -15);
  return env;
}

/**
 * Xrom va tilla uchun alohida aks: yorug' xona, qorong'i yo'llar — rasmlardagi oq studiya kabi.
 * Umumiy aks xona qorong'i bo'lgani uchun metall undan kulrang chiqadi.
 */
export function metalEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0.42, 0.43, 0.45);
  const panel = (w: number, h: number, power: number, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(power, power, power), side: THREE.DoubleSide }));
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(40, 5, 0.03, 0, -7, 14);
  panel(3, 22, 0.03, -6, 2, 14);
  panel(2, 22, 0.03, 9, 1, 12);
  panel(40, 7, 0.04, 0, -9, -12);
  panel(4, 20, 0.04, 14, 2, -7);
  panel(9, 18, 2.4, -13, 3, 7);
  panel(6, 16, 1.8, 14, 3, 5);
  panel(20, 8, 2, 0, 15, 2);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.01).texture;
  pmrem.dispose();
  return texture;
}

/**
 * Sahnaga aks va yorug'lik qo'shadi — hamma 3D mahsulot bir xil "studiyada" suratga olinadi.
 * fill: pastdagi to'ldiruvchi panel; tekis yuzli mahsulotda u old tomonda to'rtburchak aks beradi.
 * back: orqadagi yorug' panel — yotiq po'lat va shisha sirtlar shundan yorishadi.
 */
export function addStudio(scene: THREE.Scene, renderer: THREE.WebGLRenderer, { fill = true, back = false } = {}) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(fill, back), 0.02).texture;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7785, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(-6, 10, 12);
  scene.add(key);
}
