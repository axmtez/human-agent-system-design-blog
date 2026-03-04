import * as THREE from 'three';
import type { AircraftGroup } from './aircraft';
import type { TowerGroup } from './tower';

const PHASE_OFFSETS = [0, 0.4, 0.8, 1.2, 1.6];

/**
 * Update ambient animations: beacon blink, nav pulse, tower glow.
 * Call each frame from rAF.
 */
export function updateAmbientAnimations(
  scene: THREE.Scene,
  elapsed: number
): void {
  const aircraft = scene.userData.aircraft as Record<string, AircraftGroup> | undefined;
  if (aircraft) {
    const list = [aircraft.planeA, aircraft.planeB].filter(Boolean);
    list.forEach((ac, i) => {
      if (!ac) return;
      const phase = elapsed + (PHASE_OFFSETS[i] ?? 0);
      const beacon = ac.userData.beaconLight;
      if (beacon) {
        beacon.intensity = Math.sin(phase * 5) > 0.9 ? 0.8 : 0;
      }
      const pulse = 0.5 + Math.sin(elapsed * 2) * 0.15;
      const setEmissive = (mesh: THREE.Mesh | undefined): void => {
        if (mesh?.material && (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity !== undefined) {
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
        }
      };
      setEmissive(ac.userData.wingtipLeftMesh);
      setEmissive(ac.userData.wingtipRightMesh);
      setEmissive(ac.userData.tailNavMesh);
      setEmissive(ac.userData.noseNavMesh);
    });
  }

  const tower = (scene.userData as Record<string, unknown>).tower as TowerGroup | undefined;
  const cabLight = tower?.userData?.cabLight;
  if (cabLight) {
    cabLight.intensity = 0.9 + Math.sin(elapsed * 1.5) * 0.1 + Math.sin(elapsed * 3.7) * 0.05;
  }
}
