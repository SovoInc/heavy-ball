import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";

export interface PathSegmentDef {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: number;
  isBridge?: boolean;
  noWalls?: boolean;
}

export class PathSegment {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  walls: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];

  constructor(
    scene: THREE.Scene,
    physics: Physics,
    def: PathSegmentDef,
  ) {
    const [w, h, d] = def.size;
    const [px, py, pz] = def.position;
    const isBridge = def.isBridge ?? false;

    const color = isBridge ? CONFIG.colors.bridge : CONFIG.colors.path;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(px, py, pz);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    if (def.rotation) {
      this.mesh.rotation.y = def.rotation;
    }
    scene.add(this.mesh);

    // Use a thicker collision box to prevent tunneling (cannon-es has no CCD)
    const collisionH = Math.max(h, 2);
    this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(w / 2, collisionH / 2, d / 2)),
      material: physics.groundMaterial,
    });
    // Shift body down so the top surface stays at py + h/2
    this.body.position.set(px, py - (collisionH - h) / 2, pz);
    if (def.rotation) {
      this.body.quaternion.setFromEuler(0, def.rotation, 0);
    }
    physics.addBody(this.body);

    if (!def.noWalls && !isBridge) {
      this.addEdgeWalls(scene, physics, w, h, d, px, py, pz, def.rotation ?? 0);
    }

    if (isBridge) {
      this.addBridgeRails(scene, physics, w, h, d, px, py, pz, def.rotation ?? 0);
    }
  }

  private addEdgeWalls(
    scene: THREE.Scene,
    physics: Physics,
    w: number, h: number, d: number,
    px: number, py: number, pz: number,
    rotation: number,
  ) {
    const wallH = CONFIG.path.wallHeight;
    const wallT = CONFIG.path.wallThickness;

    const offsets: [number, number, number, number, number, number][] = [
      [w / 2 + wallT / 2, py + h / 2 + wallH / 2, 0, wallT, wallH, d],
      [-w / 2 - wallT / 2, py + h / 2 + wallH / 2, 0, wallT, wallH, d],
    ];

    for (const [ox, oy, oz, ww, wh, wd] of offsets) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rx = ox * cos - oz * sin + px;
      const rz = ox * sin + oz * cos + pz;

      const geo = new THREE.BoxGeometry(ww, wh, wd);
      const mat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.pathEdge,
        roughness: 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: 0.35,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(rx, oy, rz);
      if (rotation) mesh.rotation.y = rotation;
      mesh.castShadow = true;
      scene.add(mesh);

      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(ww / 2, wh / 2, wd / 2)),
        material: physics.wallMaterial,
      });
      body.position.set(rx, oy, rz);
      if (rotation) body.quaternion.setFromEuler(0, rotation, 0);
      physics.addBody(body);

      this.walls.push({ mesh, body });
    }
  }

  private addBridgeRails(
    scene: THREE.Scene,
    physics: Physics,
    w: number, h: number, d: number,
    px: number, py: number, pz: number,
    rotation: number,
  ) {
    const railH = CONFIG.path.bridgeRailHeight;
    const railT = 0.08;

    const offsets: [number, number][] = [
      [w / 2, 0],
      [-w / 2, 0],
    ];

    for (const [ox, oz] of offsets) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rx = ox * cos - oz * sin + px;
      const rz = ox * sin + oz * cos + pz;
      const ry = py + h / 2 + railH / 2;

      const geo = new THREE.BoxGeometry(railT, railH, d);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xccaa77,
        roughness: 0.6,
        metalness: 0.3,
        emissive: 0x332200,
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(rx, ry, rz);
      if (rotation) mesh.rotation.y = rotation;
      scene.add(mesh);
    }
  }
}
