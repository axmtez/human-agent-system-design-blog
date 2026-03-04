import * as THREE from 'three';

const VIEW_SIZE = 50;
const NEAR = 0.1;
const FAR = 500;

export function createOrthographicCamera(container: HTMLElement): {
  camera: THREE.OrthographicCamera;
  updateFrustum: () => void;
} {
  const aspect = container.clientWidth / container.clientHeight;
  const half = VIEW_SIZE * 0.5;
  const camera = new THREE.OrthographicCamera(
    -half * aspect,
    half * aspect,
    half,
    -half,
    NEAR,
    FAR
  );
  camera.position.set(60, 60, 60);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  const updateFrustum = (): void => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    const a = w / h;
    camera.left = -VIEW_SIZE * 0.5 * a;
    camera.right = VIEW_SIZE * 0.5 * a;
    camera.top = VIEW_SIZE * 0.5;
    camera.bottom = -VIEW_SIZE * 0.5;
    camera.updateProjectionMatrix();
  };

  return { camera, updateFrustum };
}
