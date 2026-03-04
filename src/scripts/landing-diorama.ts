/**
 * Landing page diorama: animation loop only (no scroll).
 * Tower central, runway left–right, one plane parks while the other taxis out and takes off. Loop.
 */
import * as THREE from 'three';
import {
  initTestScene,
  buildComposedScene,
  updateAmbientAnimations,
  updateLandingTakeoffLoop,
  LOOP_DURATION,
} from '../lib/diorama';

const MOBILE_BREAKPOINT_PX = 900;
const RESIZE_THROTTLE_MS = 150;
const VIEW_SIZE = 55;
const CAMERA_LOOKAT = new THREE.Vector3(0, 1, 2);

/** World positions to anchor static labels so they sit near the relevant prop (tower, ramp, center). */
const LABEL_ANCHORS: [number, number, number][] = [
  [-10, 1, 21], // THE AIRSPACE — upper left of left (second) runway strip (x=-10, z=6+15)
  [-4, 2.5, 0], // THE CONTROLLER — above tower
  [0, 0, 0],   // (unused; THE AIRCRAFT tracks plane)
  [0, 0.5, 2], // THE HANDOFF — above ramp/parking
  [0, 0, 0],   // (unused; THE GUARDRAILS tracks plane2)
  [-10, 1, 21], // THIS IS HAS DESIGN — upper left of left (second) runway
];

/** Per-label screen offset (dx, dy) in px so labels don’t overlay tower/ramp. dy negative = up. */
const LABEL_ANCHOR_OFFSETS: [number, number][] = [
  [140, -432], // THE AIRSPACE — further right, 400px up
  [72, -24],   // THE CONTROLLER — right and up from tower
  [0, 0],
  [200, -48],  // THE HANDOFF — 200px right so not over tower
  [0, 0],
  [180, -48],  // THIS IS HAS DESIGN — right so on screen, up = upper left of view
];

/** Timed beats: normalized u (0–1). Aligned with build-order ILI-423; THE AIRCRAFT starts sooner (0.06) and ends before park (0.38) per UX. */
const TIMED_BEATS: { uStart: number; uEnd: number; labelIndex: number; track: 'plane' | 'plane2' | null }[] = [
  { uStart: 0, uEnd: 0.15, labelIndex: 0, track: null },       // THE AIRSPACE — full scene
  { uStart: 0.15, uEnd: 0.3, labelIndex: 1, track: null },     // THE CONTROLLER — tower focus
  { uStart: 0.06, uEnd: 0.38, labelIndex: 2, track: 'plane' }, // THE AIRCRAFT — sooner, fade before park
  { uStart: 0.5, uEnd: 0.65, labelIndex: 3, track: null },     // THE HANDOFF — tower↔aircraft at park
  { uStart: 0.73, uEnd: 1, labelIndex: 4, track: 'plane2' },   // THE GUARDRAILS — only when plane2 is landing (not on takeoff)
  { uStart: 0.8, uEnd: 1, labelIndex: 5, track: null },        // THIS IS HAS DESIGN — full scene
];

const LABEL_ABOVE_OFFSET_PX = 24;

/** "THE AIRSPACE" (beat index 0) is fixed 400px from top of viewport, left from anchor. */
const AIRSPACE_LABEL_INDEX = 0;
const AIRSPACE_TOP_PX = 400;

/** Show THE GUARDRAILS label only when plane2 is landing (u2 >= this). Respawn/landing starts at 0.55. */
const PLANE2_LANDING_START_U = 0.55;
const PLANE2_START_U = 0.5 - 3 / LOOP_DURATION;
const _worldPos = new THREE.Vector3();

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
  const container = document.getElementById('diorama-container');
  if (!container) return;
  rafActive = false;
  if (animationId != null) cancelAnimationFrame(animationId);

  const { scene: s, camera: cam, renderer: r, canvas: c, updateFrustum } = initTestScene(container);
  scene = s;
  renderer = r;
  canvas = c;

  camera = cam;
  camera.position.set(50, 45, 50);
  camera.lookAt(CAMERA_LOOKAT);
  const aspect = container.clientWidth / container.clientHeight;
  const half = VIEW_SIZE * 0.5;
  camera.left = -half * aspect;
  camera.right = half * aspect;
  camera.top = half;
  camera.bottom = -half;
  camera.near = 0.1;
  camera.far = 500;
  camera.updateProjectionMatrix();

  buildComposedScene(scene);

  const labelsRoot = container.parentElement?.querySelector('.diorama-labels') as HTMLElement | null;
  const labelEls = labelsRoot ? Array.from(labelsRoot.querySelectorAll<HTMLElement>('.beat-label')) : [];

  const clock = new THREE.Clock();

  function updateLabels(elapsed: number): void {
    if (!labelsRoot || !labelEls.length || !camera || !scene) return;
    const u = (elapsed % LOOP_DURATION) / LOOP_DURATION;
    let current = TIMED_BEATS[0];
    for (const beat of TIMED_BEATS) {
      if (u >= beat.uStart && u < beat.uEnd) {
        current = beat;
        break;
      }
    }
    const aircraft = scene.userData.aircraft as { plane?: THREE.Group; plane2?: THREE.Group } | undefined;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const plane2PhaseU = u >= PLANE2_START_U ? (u - PLANE2_START_U) / (1 - PLANE2_START_U) : 0;
    const plane2IsLanding = plane2PhaseU >= PLANE2_LANDING_START_U;

    labelEls.forEach((el, i) => {
      const isActive = i === current.labelIndex;
      el.style.transition = 'opacity 0.25s ease';

      if (!isActive) {
        el.style.opacity = '0';
        return;
      }

      if (current.labelIndex === 4 && !plane2IsLanding) {
        el.style.opacity = '0';
        return;
      }

      if (current.track && aircraft) {
        const obj = current.track === 'plane' ? aircraft.plane : aircraft.plane2;
        if (!obj?.visible) {
          el.style.opacity = '0';
          return;
        }
        const beatSpan = current.uEnd - current.uStart;
        const beatProgress = beatSpan > 0 ? (u - current.uStart) / beatSpan : 1;
        const fadeOutStart = 0.55;
        const labelOpacity =
          current.labelIndex === 2 && beatProgress > fadeOutStart
            ? Math.max(0, 1 - (beatProgress - fadeOutStart) / (1 - fadeOutStart))
            : 1;
        obj.getWorldPosition(_worldPos);
        _worldPos.project(camera!);
        const x = ((_worldPos.x + 1) / 2) * w;
        const y = (1 - (_worldPos.y + 1) / 2) * h - LABEL_ABOVE_OFFSET_PX;
        el.style.opacity = String(labelOpacity);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.right = '';
        el.style.bottom = '';
        el.style.transform = 'translate(-50%, -100%)';
        return;
      }

      if (current.labelIndex === AIRSPACE_LABEL_INDEX) {
        const anchor = LABEL_ANCHORS[AIRSPACE_LABEL_INDEX];
        const [ox] = LABEL_ANCHOR_OFFSETS[AIRSPACE_LABEL_INDEX];
        _worldPos.set(anchor[0], anchor[1], anchor[2]);
        _worldPos.project(camera!);
        const x = ((_worldPos.x + 1) / 2) * w + ox;
        el.style.opacity = '1';
        el.style.left = `${x}px`;
        el.style.top = `${AIRSPACE_TOP_PX}px`;
        el.style.right = '';
        el.style.bottom = '';
        el.style.transform = 'translate(-50%, -100%)';
        return;
      }

      const anchor = LABEL_ANCHORS[current.labelIndex];
      const [ox, oy] = LABEL_ANCHOR_OFFSETS[current.labelIndex];
      _worldPos.set(anchor[0], anchor[1], anchor[2]);
      _worldPos.project(camera!);
      const x = ((_worldPos.x + 1) / 2) * w + ox;
      const y = (1 - (_worldPos.y + 1) / 2) * h - LABEL_ABOVE_OFFSET_PX + oy;
      el.style.opacity = '1';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.right = '';
      el.style.bottom = '';
      el.style.transform = 'translate(-50%, -100%)';
    });
  }

  function animate(): void {
    if (!rafActive || !scene || !camera || !renderer) return;
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    updateLandingTakeoffLoop(scene!, elapsed);
    updateAmbientAnimations(scene!, elapsed);
    updateLabels(elapsed);
    renderer.render(scene, camera);
  }

  const updateFrustumWithViewSize = (): void => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    const a = w / h;
    camera!.left = -VIEW_SIZE * 0.5 * a;
    camera!.right = VIEW_SIZE * 0.5 * a;
    camera!.top = VIEW_SIZE * 0.5;
    camera!.bottom = -VIEW_SIZE * 0.5;
    camera!.updateProjectionMatrix();
  };

  rafActive = true;
  const ro = new ResizeObserver(() => {
    if (resizeThrottleId) return;
    resizeThrottleId = setTimeout(() => {
      updateFrustumWithViewSize();
      resizeThrottleId = null;
    }, RESIZE_THROTTLE_MS);
  });
  ro.observe(container);
  window.addEventListener('resize', () => {
    if (resizeThrottleId) return;
    resizeThrottleId = setTimeout(() => {
      updateFrustumWithViewSize();
      resizeThrottleId = null;
    }, RESIZE_THROTTLE_MS);
  });

  const visObs = new IntersectionObserver(
    (entries) => {
      const visible = entries[0]?.isIntersecting ?? true;
      rafActive = visible;
      if (visible && scene && camera && renderer) animate();
    },
    { threshold: 0, root: null }
  );
  visObs.observe(container);

  animate();
}

export {};

function initLanding(): void {
  if (window.location.pathname !== '/' && !window.location.pathname.match(/^\/?$/)) return;
  const container = document.getElementById('diorama-container');
  if (!container) return;

  if (window.innerWidth < MOBILE_BREAKPOINT_PX) {
    container.classList.add('diorama-mobile-fallback');
    return;
  }
  container.classList.remove('diorama-mobile-fallback');
  dispose();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => run());
  });
}

if (typeof document !== 'undefined') {
  function start(): void {
    initLanding();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  document.addEventListener('astro:after-swap', () => {
    dispose();
    requestAnimationFrame(() => requestAnimationFrame(initLanding));
  });
}
