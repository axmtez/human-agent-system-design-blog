import * as THREE from 'three';
import Stats from 'stats.js';
import {
  initTestScene,
  buildComposedScene,
  updateAmbientAnimations,
} from '../lib/diorama';
import {
  STORY_BEATS,
  getBeatAtProgress,
  LERP_SNAP_THRESHOLD,
  BEAT_LABEL_POSITIONS,
  dimMeshes,
  restoreMeshes,
  lerpCameraState,
  setCameraState,
} from '../lib/diorama';

const SCROLL_TRACK_VH = 500;
const CANVAS_VH = 80;

function run(): void {
  const container = document.getElementById('diorama-container');
  const scrollTrack = document.getElementById('diorama-scroll-track');
  const labelsContainer = document.getElementById('diorama-labels');
  if (!container || !scrollTrack || !labelsContainer) return;

  const { scene, camera, renderer, updateFrustum } = initTestScene(container);
  buildComposedScene(scene);

  const clock = new THREE.Clock();

  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'absolute';
  stats.dom.style.left = '0';
  stats.dom.style.top = '0';
  container.appendChild(stats.dom);

  const aircraft = scene.userData.aircraft as Record<string, THREE.Group> | undefined;
  const tower = (scene.userData as Record<string, unknown>).tower as THREE.Group | undefined;
  const handoffLine = (scene.userData as Record<string, unknown>).handoffLine as THREE.Line | undefined;

  function getProgress(): number {
    const panel = document.getElementById('diorama-scroll-panel');
    if (!panel) return 0;
    const trackHeight = (window.innerHeight * SCROLL_TRACK_VH) / 100;
    const progress = panel.scrollTop / Math.max(trackHeight - panel.clientHeight, 1);
    return Math.max(0, Math.min(1, progress));
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

  let animationId: number;

  function animate(): void {
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
      if (t < LERP_SNAP_THRESHOLD) {
        setCameraState(camera, prevCamera, aspect);
      } else if (t >= 1 - LERP_SNAP_THRESHOLD) {
        setCameraState(camera, currCamera, aspect);
      } else {
        lerpCameraState(camera, prevCamera, currCamera, t, aspect);
      }

      restoreMeshes(scene);
      if (beat.dimGroups?.length) dimMeshes(scene, beat.dimGroups, 0.7, 1);

      const handoffOpacity = beat.handoffVisible ? 0.6 * Math.min(1, t * 2) : 0;
      updateHandoffLine(handoffOpacity);
    } else {
      setCameraState(camera, STORY_BEATS[0].camera!, aspect);
      restoreMeshes(scene);
      updateHandoffLine(0);
    }

    const labels = labelsContainer.querySelectorAll('.beat-label');
    labels.forEach((el, i) => {
      const style = (el as HTMLElement).style;
      style.opacity = result && i === result.index && result.t <= 0.85 ? '1' : '0';
      const pos = BEAT_LABEL_POSITIONS[i];
      if (pos) {
        style.left = pos.left ?? '';
        style.right = pos.right ?? '';
        style.top = pos.top ?? '';
        style.bottom = pos.bottom ?? '';
        style.transform = pos.transform ?? '';
      }
    });

    renderer.render(scene, camera);
    stats.update();
  }

  const ro = new ResizeObserver(() => updateFrustum());
  ro.observe(container);
  window.addEventListener('resize', () => updateFrustum());

  animate();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
