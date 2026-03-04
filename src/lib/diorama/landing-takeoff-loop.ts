import * as THREE from 'three';
import type { AircraftGroup } from './aircraft';
import { RUNWAY_OFFSET_X, RUNWAY_LENGTH, LEFT_RUNWAY_Z_OFFSET } from './runway';

export const LOOP_DURATION = 32;
const RUNWAY_HALF = RUNWAY_LENGTH / 2;

/** Parking (ramp) Z — must match composed.ts park position. */
const PARK_Z = 2;

/** Right runway: x = +RUNWAY_OFFSET_X. Left runway: x = -RUNWAY_OFFSET_X, center Z = LEFT_RUNWAY_Z_OFFSET. */
const RIGHT_RUNWAY_X = RUNWAY_OFFSET_X;
const LEFT_RUNWAY_X = -RUNWAY_OFFSET_X;
const LEFT_RUNWAY_Z = LEFT_RUNWAY_Z_OFFSET;
const RUNWAY_END_Z = RUNWAY_HALF;
const TURNOFF_Z = PARK_Z;
/** Left runway end (top, +Z side). Plane 2 lifts off before reaching it. */
const LEFT_RUNWAY_END_Z = LEFT_RUNWAY_Z + RUNWAY_HALF;
/** Z at which plane 2 starts takeoff climb (before runway edge). */
const LEFT_TAKEOFF_Z = LEFT_RUNWAY_END_Z - 5;

/** In our aircraft +X is nose. rotation.y = π/2 → nose -Z, -π/2 → nose +Z, π → nose -X, 0 → nose +X. */
const NOSE_NEG_Z = Math.PI / 2;
const NOSE_POS_Z = -Math.PI / 2;
const NOSE_NEG_X = Math.PI;
const NOSE_POS_X = 0;
const NOSE_PARK = Math.PI / 2;
/** Same as nose +Z but 3π/2 so interpolating from π gives one 90° turn, not 270°. */
const NOSE_POS_Z_90 = Math.PI * 1.5;

/** Keyframes: normalized time 0..1. */
interface Keyframe {
  t: number;
  pos: [number, number, number];
  rot: [number, number, number];
}

/** Off-screen Z for takeoff exit and approach spawn (past runway end). */
const OFFSCREEN_Z = RUNWAY_HALF + 20;

/**
 * Land → 90° turn → straight to park → rotate in place at park → taxi to runway → roll → take off sooner → exit.
 */
const FULL_LOOP_KEYFRAMES: Keyframe[] = [
  { t: 0, pos: [RIGHT_RUNWAY_X, 4, OFFSCREEN_Z], rot: [0.08, NOSE_NEG_Z, 0] },
  { t: 0.08, pos: [RIGHT_RUNWAY_X, 0, RUNWAY_END_Z], rot: [0, NOSE_NEG_Z, 0] },
  { t: 0.36, pos: [RIGHT_RUNWAY_X, 0, TURNOFF_Z], rot: [0, NOSE_NEG_Z, 0] },
  { t: 0.4, pos: [RIGHT_RUNWAY_X, 0, TURNOFF_Z], rot: [0, NOSE_NEG_X, 0] },
  { t: 0.5, pos: [0, 0, PARK_Z], rot: [0, NOSE_NEG_X, 0] },
  { t: 0.55, pos: [0, 0, PARK_Z], rot: [0, NOSE_PARK, 0] },
  { t: 0.6, pos: [0, 0, PARK_Z], rot: [0, NOSE_PARK, 0] },
  { t: 0.63, pos: [0, 0, PARK_Z], rot: [0, NOSE_POS_X, 0] },
  { t: 0.73, pos: [RIGHT_RUNWAY_X, 0, TURNOFF_Z], rot: [0, NOSE_POS_X, 0] },
  { t: 0.76, pos: [RIGHT_RUNWAY_X, 0, TURNOFF_Z], rot: [0, NOSE_NEG_Z, 0] },
  { t: 0.86, pos: [RIGHT_RUNWAY_X, 0, -10], rot: [0, NOSE_NEG_Z, 0] },
  { t: 0.96, pos: [RIGHT_RUNWAY_X, 5, -OFFSCREEN_Z], rot: [-0.25, NOSE_NEG_Z, 0] },
];

/** Plane 2: park → taxi to left runway → take off → despawn at exit; respawn right → land. Despawn at 0.52 so we never show the interpolated zip from left exit to right approach. */
const PLANE2_DESPAWN_U = 0.52;
const PLANE2_RESPAWN_U = 0.55;
const PLANE2_KEYFRAMES: Keyframe[] = [
  { t: 0, pos: [0, 0, PARK_Z], rot: [0, NOSE_PARK, 0] },
  { t: 0.08, pos: [0, 0, PARK_Z], rot: [0, NOSE_NEG_X, 0] },
  { t: 0.14, pos: [LEFT_RUNWAY_X, 0, PARK_Z], rot: [0, NOSE_NEG_X, 0] },
  { t: 0.2, pos: [LEFT_RUNWAY_X, 0, LEFT_RUNWAY_Z], rot: [0, NOSE_NEG_X, 0] },
  { t: 0.24, pos: [LEFT_RUNWAY_X, 0, LEFT_RUNWAY_Z], rot: [0, NOSE_POS_Z_90, 0] },
  { t: 0.38, pos: [LEFT_RUNWAY_X, 0, LEFT_TAKEOFF_Z], rot: [0, NOSE_POS_Z_90, 0] },
  { t: 0.52, pos: [LEFT_RUNWAY_X, 5, OFFSCREEN_Z], rot: [-0.25, NOSE_POS_Z_90, 0] },
  { t: 0.55, pos: [RIGHT_RUNWAY_X, 4, OFFSCREEN_Z], rot: [0.08, NOSE_NEG_Z, 0] },
  { t: 0.63, pos: [RIGHT_RUNWAY_X, 0, RUNWAY_END_Z], rot: [0, NOSE_NEG_Z, 0] },
  { t: 0.91, pos: [RIGHT_RUNWAY_X, 0, TURNOFF_Z], rot: [0, NOSE_NEG_Z, 0] },
  { t: 0.95, pos: [RIGHT_RUNWAY_X, 0, TURNOFF_Z], rot: [0, NOSE_NEG_X, 0] },
  { t: 1.0, pos: [0, 0, PARK_Z], rot: [0, NOSE_NEG_X, 0] },
];

function interpolateKeyframes(keyframes: Keyframe[], u: number): { pos: THREE.Vector3; rot: THREE.Euler } {
  let i = 0;
  for (; i < keyframes.length - 1; i++) {
    if (u <= keyframes[i + 1].t) break;
  }
  const a = keyframes[i];
  const b = keyframes[Math.min(i + 1, keyframes.length - 1)];
  const span = b.t - a.t || 1;
  const f = span > 0 ? (u - a.t) / span : 1;
  const pos = new THREE.Vector3(
    a.pos[0] + (b.pos[0] - a.pos[0]) * f,
    a.pos[1] + (b.pos[1] - a.pos[1]) * f,
    a.pos[2] + (b.pos[2] - a.pos[2]) * f
  );
  const rot = new THREE.Euler(
    a.rot[0] + (b.rot[0] - a.rot[0]) * f,
    a.rot[1] + (b.rot[1] - a.rot[1]) * f,
    a.rot[2] + (b.rot[2] - a.rot[2]) * f,
    'XYZ'
  );
  return { pos, rot };
}

/** Normalized time at which we despawn (after takeoff exit). While u >= this, plane is hidden and moved to respawn. */
const DESPAWN_U = 0.96;

export function updateLandingTakeoffLoop(scene: THREE.Scene, elapsed: number): void {
  const aircraft = scene.userData.aircraft as {
    plane: AircraftGroup;
    plane2?: AircraftGroup;
    plane3?: AircraftGroup;
  } | undefined;
  const plane = aircraft?.plane;
  if (!plane) return;

  const t = elapsed % LOOP_DURATION;
  const u = t / LOOP_DURATION;

  if (u >= DESPAWN_U) {
    plane.visible = false;
    plane.position.set(RIGHT_RUNWAY_X, 4, OFFSCREEN_Z);
    plane.rotation.set(0.08, NOSE_NEG_Z, 0);
  } else {
    plane.visible = true;
    const { pos, rot } = interpolateKeyframes(FULL_LOOP_KEYFRAMES, u);
    plane.position.copy(pos);
    plane.rotation.set(rot.x, rot.y, rot.z);
  }

  const plane2 = aircraft?.plane2;
  if (plane2) {
    const plane2Start = 0.5 - 3 / LOOP_DURATION;
    if (u < plane2Start) {
      plane2.visible = true;
      plane2.position.set(0, 0, PARK_Z);
      plane2.rotation.set(0, NOSE_PARK, 0);
    } else {
      const u2 = (u - plane2Start) / (1 - plane2Start);
      if (u2 >= PLANE2_DESPAWN_U && u2 < PLANE2_RESPAWN_U) {
        plane2.visible = false;
        plane2.position.set(RIGHT_RUNWAY_X, 4, OFFSCREEN_Z);
        plane2.rotation.set(0.08, NOSE_NEG_Z, 0);
      } else {
        plane2.visible = true;
        const { pos, rot } = interpolateKeyframes(PLANE2_KEYFRAMES, u2);
        plane2.position.copy(pos);
        plane2.rotation.set(rot.x, rot.y, rot.z);
      }
    }
  }
}
