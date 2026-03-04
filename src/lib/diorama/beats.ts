import * as THREE from 'three';

export interface CameraState {
  lookAt: THREE.Vector3;
  viewSize: number;
}

export interface StoryBeat {
  start: number;
  end: number;
  name: string;
  camera?: CameraState;
  dimGroups?: string[];
  handoffVisible?: boolean;
}

const DEFAULT_LOOKAT = new THREE.Vector3(0, 2, 0);
const DEFAULT_VIEW_SIZE = 50;

export const STORY_BEATS: StoryBeat[] = [
  {
    start: 0,
    end: 0.15,
    name: 'THE AIRSPACE',
    camera: { lookAt: DEFAULT_LOOKAT.clone(), viewSize: DEFAULT_VIEW_SIZE },
  },
  {
    start: 0.15,
    end: 0.3,
    name: 'THE CONTROLLER',
    camera: { lookAt: new THREE.Vector3(5, 2.5, -5), viewSize: 28 },
    dimGroups: ['runway', 'taxiway', 'apron', 'aircraft-parked', 'aircraft-taxiing', 'aircraft-approach', 'aircraft-holding', 'aircraft-enRoute'],
  },
  {
    start: 0.3,
    end: 0.5,
    name: 'THE AIRCRAFT',
    camera: { lookAt: new THREE.Vector3(6, 1, 0), viewSize: 38 },
    dimGroups: ['runway', 'taxiway', 'apron', 'aircraft-parked', 'aircraft-taxiing', 'aircraft-holding', 'aircraft-enRoute'],
  },
  {
    start: 0.5,
    end: 0.65,
    name: 'THE HANDOFF',
    camera: { lookAt: new THREE.Vector3(6.5, 3, -2.5), viewSize: 32 },
    handoffVisible: true,
  },
  {
    start: 0.65,
    end: 0.8,
    name: 'THE GUARDRAILS',
    camera: { lookAt: new THREE.Vector3(8, 8, -5), viewSize: 45 },
    dimGroups: ['runway', 'taxiway', 'apron', 'aircraft-parked', 'aircraft-taxiing', 'aircraft-approach', 'aircraft-enRoute'],
  },
  {
    start: 0.8,
    end: 1,
    name: 'THIS IS HAS DESIGN',
    camera: { lookAt: DEFAULT_LOOKAT.clone(), viewSize: DEFAULT_VIEW_SIZE },
  },
];

export function getBeatAtProgress(progress: number): { index: number; beat: StoryBeat; t: number } | null {
  for (let i = 0; i < STORY_BEATS.length; i++) {
    const beat = STORY_BEATS[i];
    if (progress >= beat.start && progress < beat.end) {
      const t = (progress - beat.start) / (beat.end - beat.start);
      return { index: i, beat, t };
    }
  }
  return progress >= 1 ? { index: STORY_BEATS.length - 1, beat: STORY_BEATS[STORY_BEATS.length - 1], t: 1 } : null;
}

const DIM_COLOR = new THREE.Color(0x0a0a0a);
const _color = new THREE.Color();

export function dimMeshes(
  scene: THREE.Scene,
  groupKeys: string[],
  dimAmount: number,
  _t: number
): void {
  const set = new Set(groupKeys);
  scene.traverse((obj) => {
    const key = (obj.userData as { sceneGroup?: string })?.sceneGroup;
    if (!key || !set.has(key)) return;
    obj.traverseVisible((child) => {
      if (!(child instanceof THREE.Mesh) || !child.material) return;
      const mat = Array.isArray(child.material) ? child.material[0] : child.material;
      if (!(mat instanceof THREE.MeshStandardMaterial) || !mat.color) return;
      if (!(child.userData as Record<string, unknown>).originalColor) {
        (child.userData as Record<string, unknown>).originalColor = mat.color.clone();
      }
      const orig = (child.userData as { originalColor: THREE.Color }).originalColor as THREE.Color;
      _color.lerpColors(orig, DIM_COLOR, dimAmount);
      mat.color.copy(_color);
    });
  });
}

export function restoreMeshes(scene: THREE.Scene): void {
  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.material) return;
    const orig = (obj.userData as { originalColor?: THREE.Color })?.originalColor;
    if (!orig) return;
    const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
    if (mat instanceof THREE.MeshStandardMaterial && mat.color) {
      mat.color.copy(orig);
    }
  });
}

const _lookAt = new THREE.Vector3();

export function lerpCameraState(
  camera: THREE.OrthographicCamera,
  from: CameraState,
  to: CameraState,
  t: number,
  aspect: number
): void {
  _lookAt.lerpVectors(from.lookAt, to.lookAt, t);
  camera.lookAt(_lookAt);
  const viewSize = from.viewSize + (to.viewSize - from.viewSize) * t;
  const half = viewSize * 0.5;
  camera.left = -half * aspect;
  camera.right = half * aspect;
  camera.top = half;
  camera.bottom = -half;
  camera.updateProjectionMatrix();
}

export function setCameraState(camera: THREE.OrthographicCamera, state: CameraState, aspect: number): void {
  camera.lookAt(state.lookAt);
  const half = state.viewSize * 0.5;
  camera.left = -half * aspect;
  camera.right = half * aspect;
  camera.top = half;
  camera.bottom = -half;
  camera.updateProjectionMatrix();
}
