/**
 * Grid demo: one diorama prop on the ground grid. Used by /dev/diorama/props/[prop].
 * Reads data-prop from #diorama-container to decide which asset to add at origin.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import {
  initTestScene,
  createRunway,
  createTower,
  createTaxiwaysAndApron,
  createAircraft,
  LIVERIES,
} from '../lib/diorama';

function run(): void {
  const container = document.getElementById('diorama-container');
  if (!container) return;

  const propId = (container.getAttribute('data-prop') || '').trim().toLowerCase();
  if (!propId) {
    const overlay = document.getElementById('diorama-scene-info');
    if (overlay) overlay.textContent = 'Missing data-prop. Set data-prop="runway" | "tower" | "taxiways" | "aircraft" | "holding-ring" etc.';
    return;
  }

  const { scene, camera, renderer, updateFrustum } = initTestScene(container);

  // Add the single prop at origin (or canonical position for ring)
  switch (propId) {
    case 'runway': {
      const runway = createRunway();
      runway.userData = { sceneGroup: 'runway' };
      scene.add(runway);
      break;
    }
    case 'tower': {
      const tower = createTower();
      tower.userData = { sceneGroup: 'tower' };
      scene.add(tower);
      break;
    }
    case 'taxiways':
    case 'taxiway': {
      const taxiwaysApron = createTaxiwaysAndApron();
      taxiwaysApron.userData = { sceneGroup: 'taxiway' };
      scene.add(taxiwaysApron);
      break;
    }
    case 'aircraft':
    case 'aircraft-parked': {
      const parked = createAircraft(LIVERIES.ALPHA);
      parked.rotation.y = Math.PI * 0.5;
      (parked.userData as Record<string, unknown>).sceneGroup = 'aircraft-parked';
      scene.add(parked);
      break;
    }
    case 'aircraft-taxiing': {
      const taxiing = createAircraft(LIVERIES.BRAVO);
      taxiing.rotation.y = -0.4;
      (taxiing.userData as Record<string, unknown>).sceneGroup = 'aircraft-taxiing';
      scene.add(taxiing);
      break;
    }
    case 'aircraft-approach': {
      const approach = createAircraft(LIVERIES.ALPHA);
      approach.position.set(0, 2, 0);
      approach.rotation.x = 0.05;
      (approach.userData as Record<string, unknown>).sceneGroup = 'aircraft-approach';
      scene.add(approach);
      break;
    }
    case 'aircraft-enroute':
    case 'aircraft-en-route': {
      const enRoute = createAircraft(LIVERIES.BRAVO);
      enRoute.rotation.y = -0.6;
      (enRoute.userData as Record<string, unknown>).sceneGroup = 'aircraft-enRoute';
      scene.add(enRoute);
      break;
    }
    default: {
      const overlay = document.getElementById('diorama-scene-info');
      if (overlay) overlay.textContent = `Unknown prop: "${propId}". Use runway | tower | taxiways | aircraft | aircraft-parked | aircraft-taxiing | aircraft-approach | aircraft-enroute`;
      return;
    }
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'absolute';
  stats.dom.style.left = '0';
  stats.dom.style.top = '0';
  container.appendChild(stats.dom);

  const overlay = document.getElementById('diorama-scene-info');
  function updateOverlay(): void {
    if (!overlay) return;
    const p = camera.position;
    overlay.textContent = `Prop: ${propId} | Camera: (${p.x.toFixed(0)}, ${p.y.toFixed(0)}, ${p.z.toFixed(0)})`;
  }

  let animationId: number;
  function animate(): void {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    stats.update();
    updateOverlay();
  }

  const ro = new ResizeObserver(() => updateFrustum());
  ro.observe(container);
  window.addEventListener('resize', () => updateFrustum());

  animate();
  updateOverlay();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
