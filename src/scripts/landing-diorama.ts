/**
 * Landing page diorama: scroll-driven story, labels, CTA.
 * Re-inits on astro:after-swap when returning to /. ILI-427, ILI-428.
 */
import * as THREE from 'three';
import {
  initTestScene,
  buildComposedScene,
  updateAmbientAnimations,
} from '../lib/diorama';
import {
  STORY_BEATS,
  getBeatAtProgress,
  dimMeshes,
  restoreMeshes,
  lerpCameraState,
  setCameraState,
} from '../lib/diorama';

const SCROLL_TRACK_VH = 500;
const MOBILE_BREAKPOINT_PX = 900;
const RESIZE_THROTTLE_MS = 150;

let scene: THREE.Scene | null = null;
let resizeThrottleId: ReturnType<typeof setTimeout> | null = null;
let camera: THREE.OrthographicCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let canvas: HTMLCanvasElement | null = null;
let animationId: number | null = null;
let rafActive = false;

function dispose(): void {
  if (animationId != null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  rafActive = false;
  if (scene) {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry) obj.geometry.dispose();
      if (obj instanceof THREE.Mesh && obj.material) {
        const m = obj.material;
        if (Array.isArray(m)) m.forEach((mat) => mat.dispose());
        else m.dispose();
      }
    });
    scene = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }
  canvas = null;
  camera = null;
}

function run(): void {
  const scrollPanel = document.getElementById('diorama-scroll-panel');
  const container = document.getElementById('diorama-container');
  const labelsContainer = document.getElementById('diorama-labels');
  if (!scrollPanel || !container || !labelsContainer) return;
  rafActive = false;
  if (animationId != null) cancelAnimationFrame(animationId);

  const { scene: s, camera: cam, renderer: r, canvas: c, updateFrustum } = initTestScene(container);
  scene = s;
  camera = cam;
  renderer = r;
  canvas = c;
  buildComposedScene(scene);

  const clock = new THREE.Clock();
  const aircraft = scene.userData.aircraft as Record<string, THREE.Group> | undefined;
  const handoffLine = (scene.userData as Record<string, unknown>).handoffLine as THREE.Line | undefined;

  function getProgress(): number {
    const trackHeight = (window.innerHeight * SCROLL_TRACK_VH) / 100;
    const maxScroll = trackHeight - scrollPanel.clientHeight;
    if (maxScroll <= 0) return 0;
    return Math.max(0, Math.min(1, scrollPanel.scrollTop / maxScroll));
  }

  function updateHandoffLine(opacity: number): void {
    if (!handoffLine?.geometry || !aircraft?.approach) return;
    const towerWorld = new THREE.Vector3(5, 4.2, -5);
    const approachWorld = new THREE.Vector3();
    aircraft.approach.getWorldPosition(approachWorld);
    const pos = handoffLine.geometry.attributes.position as THREE.BufferAttribute;
    if (pos) {
      pos.setXYZ(0, towerWorld.x, towerWorld.y, towerWorld.z);
      pos.setXYZ(1, approachWorld.x, approachWorld.y, approachWorld.z);
      pos.needsUpdate = true;
    }
    (handoffLine.material as THREE.LineDashedMaterial).opacity = opacity;
    handoffLine.computeLineDistances();
  }

  function animate(): void {
    if (!rafActive || !scene || !camera || !renderer) return;
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    updateAmbientAnimations(scene, elapsed);

    const progress = getProgress();
    const result = getBeatAtProgress(progress);
    const aspect = container.clientWidth / container.clientHeight;

    if (result) {
      const { index, beat, t } = result;
      const prevBeat = index > 0 ? STORY_BEATS[index - 1] : STORY_BEATS[0];
      const prevCamera = prevBeat.camera ?? { lookAt: new THREE.Vector3(0, 2, 0), viewSize: 50 };
      const currCamera = beat.camera ?? prevCamera;
      lerpCameraState(camera, prevCamera, currCamera, t, aspect);
      restoreMeshes(scene);
      if (beat.dimGroups?.length) dimMeshes(scene, beat.dimGroups, 0.7, 1);
      const handoffOpacity = beat.handoffVisible ? 0.6 * Math.min(1, t * 2) : 0;
      updateHandoffLine(handoffOpacity);

      const labels = labelsContainer.querySelectorAll('.beat-label');
      labels.forEach((el, i) => {
        (el as HTMLElement).style.opacity = i === index && t <= 0.85 ? '1' : '0';
      });
    } else {
      setCameraState(camera, STORY_BEATS[0].camera!, aspect);
      restoreMeshes(scene);
      updateHandoffLine(0);
      labelsContainer.querySelectorAll('.beat-label').forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
      });
    }

    renderer.render(scene, camera);
  }

  const ctaLink = document.querySelector('.diorama-cta__link') as HTMLAnchorElement | null;
  if (ctaLink) {
    const storageKey = 'has-design-read-articles';
    let nextSlug = 'start-here';
    try {
      const stored = localStorage.getItem(storageKey);
      const read = stored ? JSON.parse(stored) : [];
      const foundations = ['start-here', 'the-stack', 'deep-dive'];
      const next = foundations.find((s) => !read.includes(s));
      if (next) nextSlug = next;
    } catch {
      /* use default */
    }
    const isNew = nextSlug === 'start-here';
    ctaLink.href = `/reading/${nextSlug}`;
    ctaLink.textContent = isNew ? 'BEGIN PART 1 →' : `CONTINUE → ${nextSlug.replace(/-/g, ' ')}`;
  }

  rafActive = true;
  const ro = new ResizeObserver(() => {
    if (resizeThrottleId) return;
    resizeThrottleId = setTimeout(() => {
      updateFrustum();
      resizeThrottleId = null;
    }, RESIZE_THROTTLE_MS);
  });
  ro.observe(container);
  window.addEventListener('resize', () => {
    if (resizeThrottleId) return;
    resizeThrottleId = setTimeout(() => {
      updateFrustum();
      resizeThrottleId = null;
    }, RESIZE_THROTTLE_MS);
  });

  const visObs = new IntersectionObserver(
    (entries) => {
      const visible = entries[0]?.isIntersecting ?? true;
      rafActive = visible;
      if (visible && scene && camera && renderer) animate();
    },
    { threshold: 0.1, root: null }
  );
  visObs.observe(container);

  animate();
}

function initLanding(): void {
  if (window.location.pathname !== '/' && !window.location.pathname.match(/^\/?$/)) return;
  const scrollPanel = document.getElementById('diorama-scroll-panel');
  const container = document.getElementById('diorama-container');
  if (!scrollPanel || !container) return;

  if (window.innerWidth < MOBILE_BREAKPOINT_PX) {
    container.classList.add('diorama-mobile-fallback');
    return;
  }
  container.classList.remove('diorama-mobile-fallback');
  dispose();
  requestAnimationFrame(() => run());
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLanding());
  } else {
    initLanding();
  }
  document.addEventListener('astro:after-swap', () => {
    dispose();
    initLanding();
  });
}
