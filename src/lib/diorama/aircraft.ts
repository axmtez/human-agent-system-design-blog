import * as THREE from 'three';

export interface LiveryConfig {
  hullColor: string;
  accentColor: string;
}

export const LIVERIES = {
  ALPHA: { hullColor: '#cccccc', accentColor: '#4a9eff' } as LiveryConfig,
  BRAVO: { hullColor: '#e0e0e0', accentColor: '#f0a050' } as LiveryConfig,
  CHARLIE: { hullColor: '#b0b8c0', accentColor: '#50c878' } as LiveryConfig,
} as const;

export interface AircraftGroup extends THREE.Group {
  userData: {
    beaconLight?: THREE.PointLight;
    wingtipLeftMesh?: THREE.Mesh;
    wingtipRightMesh?: THREE.Mesh;
    tailNavMesh?: THREE.Mesh;
    noseNavMesh?: THREE.Mesh;
  };
}

/**
 * One simple aircraft: fuselage, horizontal wing, vertical tail, two engines, lights.
 * Same geometry for all roles; only position/rotation/livery differ.
 */
export function createAircraft(config: LiveryConfig = LIVERIES.ALPHA): AircraftGroup {
  const hullColor = typeof config.hullColor === 'string' ? parseInt(config.hullColor.slice(1), 16) : 0xcccccc;
  const accentColor = typeof config.accentColor === 'string' ? parseInt(config.accentColor.slice(1), 16) : 0x4a9eff;

  const group = new THREE.Group() as AircraftGroup;
  group.userData = {};

  const hullMat = new THREE.MeshStandardMaterial({
    color: hullColor,
    roughness: 0.6,
    metalness: 0.15,
    flatShading: true,
  });

  // Fuselage: octagonal tube along X (nose +X), 8 sides, no taper
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.2, 8), hullMat);
  fuselage.rotation.z = Math.PI / 2;
  fuselage.castShadow = true;
  group.add(fuselage);

  // Nose: rounded cap to close the front (hemisphere, not a hard point)
  const noseCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    hullMat.clone()
  );
  noseCap.rotation.z = -Math.PI / 2;
  noseCap.position.x = 1.6;
  noseCap.castShadow = true;
  group.add(noseCap);

  // Main wing: symmetric triangle in XZ — tip at nose, base at tail; same extent fore/aft so it centers from every angle
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0.6, 0);
  wingShape.lineTo(-0.6, 1.6);
  wingShape.lineTo(-0.6, -1.6);
  wingShape.closePath();
  const wingGeom = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: false });
  const wing = new THREE.Mesh(wingGeom, hullMat.clone());
  wing.position.set(0.2, 0, 0);
  wing.rotation.x = -Math.PI / 2;
  wing.castShadow = true;
  group.add(wing);

  // Vertical tail (fin): right triangle in XY plane — runs with hull (base along X), flat vertical at tail, sticks up (Y)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0.7);
  finShape.lineTo(0, 0);
  finShape.lineTo(0.25, 0);
  finShape.closePath();
  const finGeom = new THREE.ExtrudeGeometry(finShape, { depth: 0.06, bevelEnabled: false });
  const vStab = new THREE.Mesh(
    finGeom,
    new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.6,
      metalness: 0.15,
      flatShading: true,
    })
  );
  vStab.position.set(-1.55, 0.25, 0);
  vStab.scale.setScalar(1.1);
  vStab.castShadow = true;
  group.add(vStab);

  // Two engines under wing
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.3,
    roughness: 0.5,
    flatShading: true,
  });
  const engineGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6);
  const engineL = new THREE.Mesh(engineGeom, engineMat);
  engineL.rotation.z = Math.PI / 2;
  engineL.position.set(0.25, -0.2, 0.75);
  engineL.castShadow = true;
  group.add(engineL);
  const engineR = new THREE.Mesh(engineGeom, engineMat.clone());
  engineR.rotation.z = Math.PI / 2;
  engineR.position.set(0.25, -0.2, -0.75);
  engineR.castShadow = true;
  group.add(engineR);

  // Lights: small dots so they don't dominate
  const navGeom = new THREE.SphereGeometry(0.03, 4, 4);
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.6 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x00aa00, emissive: 0x00aa00, emissiveIntensity: 0.6 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xcccccc, emissiveIntensity: 0.4 });

  const sphereL = new THREE.Mesh(navGeom, redMat);
  sphereL.position.set(0.25, 0, 0.55);
  group.add(sphereL);
  group.userData.wingtipLeftMesh = sphereL;

  const sphereR = new THREE.Mesh(navGeom, greenMat);
  sphereR.position.set(0.25, 0, -0.55);
  group.add(sphereR);
  group.userData.wingtipRightMesh = sphereR;

  const tailNav = new THREE.Mesh(navGeom, whiteMat.clone());
  tailNav.position.set(-1.55, 0.25, 0);
  group.add(tailNav);
  group.userData.tailNavMesh = tailNav;

  const noseNav = new THREE.Mesh(navGeom, whiteMat.clone());
  noseNav.position.set(1.6, 0, 0.1);
  group.add(noseNav);
  group.userData.noseNavMesh = noseNav;

  const beaconLight = new THREE.PointLight(0xff3333, 0.4, 5, 2);
  beaconLight.position.set(0, -0.25, 0);
  group.add(beaconLight);
  const beaconSphere = new THREE.Mesh(
    navGeom,
    new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.5 })
  );
  beaconSphere.position.set(0, -0.25, 0);
  group.add(beaconSphere);
  group.userData.beaconLight = beaconLight;

  return group;
}
