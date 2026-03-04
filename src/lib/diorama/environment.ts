import * as THREE from 'three';
import { createRenderer } from './renderer';
import { createOrthographicCamera } from './camera';
import { createLights } from './lights';
import { createGround } from './ground';

export interface TestScene {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  updateFrustum: () => void;
}

/**
 * Initialize the shared test scene: renderer, orthographic camera, lighting, ground plane.
 * Used by /dev/diorama/environment and by all asset test routes.
 * @param container - Element that will contain the canvas (used for resize).
 */
export function initTestScene(container: HTMLElement): TestScene {
  const scene = new THREE.Scene();

  const { renderer, canvas } = createRenderer(container);
  container.appendChild(canvas);

  const { camera, updateFrustum } = createOrthographicCamera(container);
  createLights(scene);
  createGround(scene);

  return { scene, camera, renderer, canvas, updateFrustum };
}
