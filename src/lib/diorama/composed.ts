import * as THREE from 'three';
import { createRunway } from './runway';
import { createTower } from './tower';
import { createTaxiwaysAndApron } from './taxiways';
import { createAircraft, LIVERIES } from './aircraft';

/** Parking (ramp) at center. Tower slid down and left of the parking lot. */
const PARK_POSITION = new THREE.Vector3(0, 0, 2);
const TOWER_POSITION = new THREE.Vector3(-4, 0, 0);

/**
 * Assemble diorama: runway, tower, ramp, three aircraft.
 * Plane 1: land on right runway → park → taxi → take off. Plane 2: start parked → taxi to left runway → take off opposite way. Plane 3: fly edge-to-edge at random intervals.
 */
export function buildComposedScene(scene: THREE.Scene): void {
  const runway = createRunway();
  runway.userData = { sceneGroup: 'runway' };
  scene.add(runway);

  const tower = createTower();
  tower.position.copy(TOWER_POSITION);
  tower.userData = { sceneGroup: 'tower' };
  scene.add(tower);

  const taxiwaysApron = createTaxiwaysAndApron();
  taxiwaysApron.position.copy(PARK_POSITION);
  taxiwaysApron.userData = { sceneGroup: 'taxiway' };
  scene.add(taxiwaysApron);

  const plane = createAircraft(LIVERIES.ALPHA);
  plane.position.set(10, 4, 35);
  plane.rotation.set(0.08, Math.PI / 2, 0);
  (plane.userData as Record<string, unknown>).sceneGroup = 'aircraft';
  scene.add(plane);

  const plane2 = createAircraft(LIVERIES.BRAVO);
  plane2.position.copy(PARK_POSITION);
  plane2.rotation.y = Math.PI / 2;
  (plane2.userData as Record<string, unknown>).sceneGroup = 'aircraft2';
  scene.add(plane2);

  const plane3 = createAircraft(LIVERIES.CHARLIE);
  plane3.position.set(0, 8, -40);
  plane3.rotation.y = -Math.PI / 2;
  (plane3.userData as Record<string, unknown>).sceneGroup = 'aircraft3';
  scene.add(plane3);

  scene.userData.aircraft = { plane, plane2, plane3, planeA: plane, planeB: plane2 };
  (scene.userData as Record<string, unknown>).tower = tower;
  (scene.userData as Record<string, unknown>).parkPosition = PARK_POSITION.clone();
}
