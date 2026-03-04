/**
 * Props grid: each prop in a cell with isometric camera. Used by /dev/diorama/props/
 */
import * as THREE from 'three';
import {
  createRenderer,
  createLights,
  createGround,
  createRunway,
  createTower,
  createTaxiwaysAndApron,
  createAircraft,
  LIVERIES,
} from '../lib/diorama';

/** Tighter view so props read clearly in each cell (main diorama uses 50). */
const PROPS_GRID_VIEW_SIZE = 16;

function createPropsGridCamera(container: HTMLElement): {
  camera: THREE.OrthographicCamera;
  updateFrustum: () => void;
} {
  const aspect = container.clientWidth / container.clientHeight;
  const half = PROPS_GRID_VIEW_SIZE * 0.5;
  const camera = new THREE.OrthographicCamera(
    -half * aspect,
    half * aspect,
    half,
    -half,
    0.1,
    500
  );
  camera.position.set(60, 60, 60);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  const updateFrustum = (): void => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    const a = w / h;
    camera.left = -PROPS_GRID_VIEW_SIZE * 0.5 * a;
    camera.right = PROPS_GRID_VIEW_SIZE * 0.5 * a;
    camera.top = PROPS_GRID_VIEW_SIZE * 0.5;
    camera.bottom = -PROPS_GRID_VIEW_SIZE * 0.5;
    camera.updateProjectionMatrix();
  };

  return { camera, updateFrustum };
}

interface CellScene {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  updateFrustum: () => void;
}

function addPropForId(scene: THREE.Scene, propId: string): void {
  switch (propId) {
    case 'runway': {
      const runway = createRunway();
      scene.add(runway);
      break;
    }
    case 'tower': {
      const tower = createTower();
      scene.add(tower);
      break;
    }
    case 'taxiways': {
      const taxiways = createTaxiwaysAndApron();
      /* Center the ramp in view (apron is at 10, 0, -6 in group space) */
      taxiways.position.set(-10, 0, 6);
      scene.add(taxiways);
      break;
    }
    case 'aircraft-parked': {
      const parked = createAircraft(LIVERIES.ALPHA);
      parked.rotation.y = Math.PI * 0.5;
      scene.add(parked);
      break;
    }
    case 'aircraft-taxiing': {
      const taxiing = createAircraft(LIVERIES.BRAVO);
      taxiing.rotation.y = -0.4;
      scene.add(taxiing);
      break;
    }
    case 'aircraft-approach': {
      const approach = createAircraft(LIVERIES.ALPHA);
      approach.position.set(0, 2, 0);
      approach.rotation.x = 0.05;
      scene.add(approach);
      break;
    }
    case 'aircraft-holding': {
      const holding = createAircraft(LIVERIES.CHARLIE);
      holding.position.set(HOLDING_RADIUS, 10, 0);
      holding.rotation.y = -Math.PI / 2;
      scene.add(holding);
      break;
    }
    case 'aircraft-enroute': {
      const enRoute = createAircraft(LIVERIES.BRAVO);
      enRoute.rotation.y = -0.6;
      scene.add(enRoute);
      break;
    }
    default:
      break;
  }
}

function run(): void {
  const cells = document.querySelectorAll<HTMLElement>('.prop-cell');
  if (!cells.length) return;

  const cellScenes: CellScene[] = [];

  cells.forEach((cell) => {
    const propId = (cell.getAttribute('data-prop') || '').trim();
    if (!propId) return;

    const scene = new THREE.Scene();
    const { renderer, canvas } = createRenderer(cell);
    const { camera, updateFrustum } = createPropsGridCamera(cell);

    cell.insertBefore(canvas, cell.firstChild);

    const ro = new ResizeObserver(() => updateFrustum());
    ro.observe(cell);

    createLights(scene);
    createGround(scene);
    addPropForId(scene, propId);

    cellScenes.push({ scene, camera, renderer, updateFrustum });
  });

  if (cellScenes.length === 0) return;

  let animationId: number;
  function animate(): void {
    animationId = requestAnimationFrame(animate);
    cellScenes.forEach(({ scene, camera, renderer }) => {
      renderer.render(scene, camera);
    });
  }

  animate();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
