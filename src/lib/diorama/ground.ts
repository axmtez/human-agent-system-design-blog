import * as THREE from 'three';

const SIZE = 120;
const GRID_DIVISIONS = 60;
const GRID_COLOR = 0x151515;

export function createGround(scene: THREE.Scene): void {
  const planeGeom = new THREE.PlaneGeometry(SIZE, SIZE);
  planeGeom.rotateX(-Math.PI / 2);
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.95,
    metalness: 0,
    flatShading: true,
  });
  const plane = new THREE.Mesh(planeGeom, planeMat);
  plane.receiveShadow = true;
  scene.add(plane);

  const grid = new THREE.GridHelper(SIZE, GRID_DIVISIONS, GRID_COLOR, GRID_COLOR);
  grid.position.y = 0.01;
  scene.add(grid);
}
