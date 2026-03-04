import * as THREE from 'three';
import { createRunway } from './runway';
import { createTower } from './tower';
import { createTaxiwaysAndApron } from './taxiways';
import { createHoldingRing } from './holding';
import { createAircraft, LIVERIES } from './aircraft';

const HOLDING_CENTER = new THREE.Vector3(10, 10, -10);
const HOLDING_RADIUS = 6;

/**
 * Assemble full static diorama: ground assets, tower, aircraft (5 states), holding ring, handoff line.
 * ILI-415, ILI-416, ILI-439. All groups tagged with userData.sceneGroup for Step 5 dim system.
 */
export function buildComposedScene(scene: THREE.Scene): void {
  const runway = createRunway();
  runway.userData = { sceneGroup: 'runway' };
  scene.add(runway);

  const tower = createTower();
  tower.position.set(5, 0, -5);
  tower.userData = { sceneGroup: 'tower' };
  scene.add(tower);

  const taxiwaysApron = createTaxiwaysAndApron();
  taxiwaysApron.userData = { sceneGroup: 'taxiway' };
  scene.add(taxiwaysApron);

  const parked = createAircraft(LIVERIES.ALPHA);
  parked.position.set(7, 0, -5);
  parked.rotation.y = Math.PI * 0.5;
  (parked.userData as Record<string, unknown>).sceneGroup = 'aircraft-parked';
  scene.add(parked);

  const taxiing = createAircraft(LIVERIES.BRAVO);
  taxiing.position.set(4, 0, -4.5);
  taxiing.rotation.y = -0.4;
  (taxiing.userData as Record<string, unknown>).sceneGroup = 'aircraft-taxiing';
  scene.add(taxiing);

  const approach = createAircraft(LIVERIES.ALPHA);
  approach.position.set(8, 2, 0);
  approach.rotation.x = 0.05;
  (approach.userData as Record<string, unknown>).sceneGroup = 'aircraft-approach';
  scene.add(approach);

  const holding = createAircraft(LIVERIES.CHARLIE);
  holding.position.set(HOLDING_CENTER.x + HOLDING_RADIUS, HOLDING_CENTER.y, HOLDING_CENTER.z);
  holding.rotation.y = -Math.PI / 2;
  (holding.userData as Record<string, unknown>).sceneGroup = 'aircraft-holding';
  scene.add(holding);

  const enRoute = createAircraft(LIVERIES.BRAVO);
  enRoute.position.set(20, 16, -8);
  enRoute.rotation.y = -0.6;
  (enRoute.userData as Record<string, unknown>).sceneGroup = 'aircraft-enRoute';
  scene.add(enRoute);

  scene.userData.aircraft = {
    parked,
    taxiing,
    approach,
    holding,
    enRoute,
  };

  const ring = createHoldingRing();
  ring.position.copy(HOLDING_CENTER);
  ring.userData = { center: HOLDING_CENTER.clone(), radius: HOLDING_RADIUS };
  scene.add(ring);
  (scene.userData as Record<string, unknown>).holdingRing = ring;
  (scene.userData as Record<string, unknown>).tower = tower;

  const handoffLineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(5, 4.2, -5),
    new THREE.Vector3(8, 2, 0),
  ]);
  const handoffLineMat = new THREE.LineBasicMaterial({
    color: 0x4a9eff,
    transparent: true,
    opacity: 0,
  });
  const handoffLine = new THREE.Line(handoffLineGeom, handoffLineMat);
  handoffLine.userData = { sceneGroup: 'handoff-line' };
  scene.add(handoffLine);
}
