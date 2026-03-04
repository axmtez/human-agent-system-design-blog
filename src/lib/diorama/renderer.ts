import * as THREE from 'three';

const BACKGROUND = 0x0a0a0a;

export function createRenderer(container: HTMLElement): {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
} {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(BACKGROUND, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.powerPreference = 'high-performance';

  const onResize = (): void => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w > 0 && h > 0) {
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  };

  const ro = new ResizeObserver(onResize);
  ro.observe(container);
  window.addEventListener('resize', onResize);

  (renderer as unknown as { _dioramaResizeCleanup?: () => void })._dioramaResizeCleanup = () => {
    ro.disconnect();
    window.removeEventListener('resize', onResize);
  };

  return { renderer, canvas };
}
