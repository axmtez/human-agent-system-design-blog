import * as THREE from 'three';

export function createLights(scene: THREE.Scene): void {
  const ambient = new THREE.AmbientLight(0x222222, 0.3);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1.2);
  directional.position.set(40, 80, 30);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 200;
  directional.shadow.camera.left = -60;
  directional.shadow.camera.right = 60;
  directional.shadow.camera.top = 60;
  directional.shadow.camera.bottom = -60;
  directional.shadow.bias = -0.0005;
  scene.add(directional);

  const hemisphere = new THREE.HemisphereLight(0x4466aa, 0x111111, 0.25);
  scene.add(hemisphere);
}
