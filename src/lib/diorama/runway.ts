import * as THREE from 'three';

export const RUNWAY_LENGTH = 30;
const RUNWAY_WIDTH = 3;
const RUNWAY_HEIGHT = 0.05;
const MARKING_Y = 0.06;
const CENTERLINE_SPACING = 1.2;
const CENTERLINE_DASH = { w: 0.6, h: 0.02, d: 0.08 };
const THRESHOLD_BAR = { w: 0.08, h: 0.02, d: 1.5 };
const THRESHOLD_BAR_SPACING = 0.15;
const THRESHOLD_BAR_COUNT = 5;

/** Distance from center (tower/parking) to each runway center. Runways on either side. */
export const RUNWAY_OFFSET_X = 10;

/** Z offset for the left runway so it sits higher; right runway stays at z=0. */
export const LEFT_RUNWAY_Z_OFFSET = 6;

const markingMat = new THREE.MeshStandardMaterial({
  color: 0x707070,
  roughness: 0.8,
  metalness: 0,
  flatShading: true,
});

/**
 * One runway strip: length along Z, width along X. Used for left and right runways.
 * centerZ: optional Z offset (e.g. for left runway slid down).
 */
function createRunwayStrip(
  mat: THREE.MeshStandardMaterial,
  centerX: number,
  centerZ: number = 0
): THREE.Group {
  const strip = new THREE.Group();
  const halfLen = RUNWAY_LENGTH / 2;
  // Geometry: width X, height Y, length Z (strip runs along Z)
  const geom = new THREE.BoxGeometry(RUNWAY_WIDTH, RUNWAY_HEIGHT, RUNWAY_LENGTH);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.position.set(centerX, RUNWAY_HEIGHT / 2, centerZ);
  strip.add(mesh);

  const dashStart = -halfLen + CENTERLINE_DASH.w / 2;
  const dashEnd = halfLen - CENTERLINE_DASH.w / 2;
  for (let t = dashStart; t <= dashEnd; t += CENTERLINE_SPACING) {
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(CENTERLINE_DASH.w, CENTERLINE_DASH.h, CENTERLINE_DASH.d),
      markingMat
    );
    dash.rotation.y = Math.PI / 2;
    dash.position.set(centerX, MARKING_Y, centerZ + t);
    strip.add(dash);
  }

  const barGeom = new THREE.BoxGeometry(THRESHOLD_BAR.w, THRESHOLD_BAR.h, THRESHOLD_BAR.d);
  const barHalf = ((THRESHOLD_BAR_COUNT - 1) * THRESHOLD_BAR_SPACING) / 2;
  for (let i = 0; i < THRESHOLD_BAR_COUNT; i++) {
    const xOff = -barHalf + i * THRESHOLD_BAR_SPACING;
    const b1 = new THREE.Mesh(barGeom, markingMat.clone());
    b1.rotation.y = Math.PI / 2;
    b1.position.set(centerX + xOff, MARKING_Y, centerZ - halfLen);
    strip.add(b1);
    const b2 = new THREE.Mesh(barGeom, markingMat.clone());
    b2.rotation.y = Math.PI / 2;
    b2.position.set(centerX + xOff, MARKING_Y, centerZ + halfLen);
    strip.add(b2);
  }

  return strip;
}

/**
 * Two runways, 90° rotated (length along Z), on either side of tower and parking.
 * Left runway at -RUNWAY_OFFSET_X, right at +RUNWAY_OFFSET_X. Tower and parking flat at center.
 */
export function createRunway(): THREE.Group {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x404040,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
  });

  const left = createRunwayStrip(mat, -RUNWAY_OFFSET_X, LEFT_RUNWAY_Z_OFFSET);
  group.add(left);
  const right = createRunwayStrip(mat.clone(), RUNWAY_OFFSET_X, 0);
  group.add(right);

  return group;
}
