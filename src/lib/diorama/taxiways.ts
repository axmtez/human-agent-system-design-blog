import * as THREE from 'three';

/**
 * One graphic on the isometric grid: the ramp (apron).
 * No taxiway strips — runways can float; this is just a flat slab so parked/taxiing
 * aircraft have a place to sit. Recognizable by itself.
 */
const APRON_SIZE = { x: 12, y: 0.03, z: 8 };
const APRON_COLOR = 0x505050;

export function createTaxiwaysAndApron(): THREE.Group {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: APRON_COLOR,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
  });

  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(APRON_SIZE.x, APRON_SIZE.y, APRON_SIZE.z),
    mat
  );
  apron.position.set(0, APRON_SIZE.y / 2, 0);
  apron.receiveShadow = true;
  apron.userData = { sceneGroup: 'apron' };
  group.add(apron);

  return group;
}
