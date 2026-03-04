import * as THREE from 'three';
import type { AircraftGroup } from './aircraft';
import type { TowerGroup } from './tower';

const PHASE_OFFSETS = [0, 0.4, 0.8, 1.2, 1.6];

/**
 * Update ambient animations: beacon blink, nav pulse, holding orbit, tower glow.
 * Call each frame from rAF. ILI-418, ILI-419, ILI-420.
 */
export function updateAmbientAnimations(
  scene: THREE.Scene,
  elapsed: number
): void {
  const aircraft = scene.userData.aircraft as Record<string, AircraftGroup> | undefined;
  if (aircraft) {
    const list = [
      aircraft.parked,
      aircraft.taxiing,
      aircraft.approach,
      aircraft.holding,
      aircraft.enRoute,
    ];
    list.forEach((ac, i) => {
      if (!ac) return;
      const phase = elapsed + (PHASE_OFFSETS[i] ?? 0);
      const beacon = ac.userData.beaconLight;
      if (beacon) {
        beacon.intensity = Math.sin(phase * 5) > 0.9 ? 0.8 : 0;
      }
      const wingL = ac.userData.wingtipLeft;
      const wingR = ac.userData.wingtipRight;
      if (wingL) wingL.intensity = 0.2 + Math.sin(elapsed * 2) * 0.1;
      if (wingR) wingR.intensity = 0.2 + Math.sin(elapsed * 2) * 0.1;
    });
  }

  const holding = (scene.userData as Record<string, unknown>).holdingRing as THREE.Object3D | undefined;
  const aircraftHolding = aircraft?.holding;
  if (holding?.userData && aircraftHolding) {
    const center = (holding.userData as { center?: THREE.Vector3 }).center as THREE.Vector3;
    const radius = (holding.userData as { radius?: number }).radius as number;
    if (center && typeof radius === 'number') {
      const angle = elapsed * 0.3;
      aircraftHolding.position.x = center.x + Math.cos(angle) * radius;
      aircraftHolding.position.z = center.z + Math.sin(angle) * radius;
      aircraftHolding.position.y = center.y;
      aircraftHolding.rotation.y = -angle + Math.PI / 2;
      aircraftHolding.rotation.z = 0.1;
    }
  }

  const tower = (scene.userData as Record<string, unknown>).tower as TowerGroup | undefined;
  const cabLight = tower?.userData?.cabLight;
  if (cabLight) {
    cabLight.intensity = 0.9 + Math.sin(elapsed * 1.5) * 0.1 + Math.sin(elapsed * 3.7) * 0.05;
  }
}
