import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Physics } from "../physics";

export interface ObstacleDef {
  position: [number, number, number];
  size: [number, number, number];
  color?: number;
  rotation?: number;
  breakable?: boolean;
  moving?: {
    axis: "x" | "z";
    range: number;
    speed: number;
  };
}

export class Obstacle {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  breakable: boolean;
  destroyed = false;
  color: number;
  size: [number, number, number];
  private movingDef?: ObstacleDef["moving"];
  private origin: [number, number, number];
  private time = 0;

  constructor(scene: THREE.Scene, physics: Physics, def: ObstacleDef) {
    const [w, h, d] = def.size;
    const [px, py, pz] = def.position;
    this.origin = [px, py, pz];
    this.movingDef = def.moving;
    this.breakable = def.breakable ?? false;
    this.color = def.color ?? 0x665544;
    this.size = def.size;

    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: def.color ?? 0x665544,
      roughness: 0.7,
      metalness: 0.2,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(px, py, pz);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    if (def.rotation) this.mesh.rotation.y = def.rotation;
    scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Sphere(Math.max(w, h, d) / 2 + 0.1),
      material: physics.wallMaterial,
      type: CANNON.Body.KINEMATIC,
    });
    this.body.position.set(px, py, pz);
    if (def.rotation) this.body.quaternion.setFromEuler(0, def.rotation, 0);
    physics.addBody(this.body);
  }

  update(dt: number) {
    if (!this.movingDef) return;
    this.time += dt;
    const { axis, range, speed } = this.movingDef;
    const offset = Math.sin(this.time * speed) * range;

    if (axis === "x") {
      this.body.position.x = this.origin[0] + offset;
    } else {
      this.body.position.z = this.origin[2] + offset;
    }
    this.mesh.position.copy(
      this.body.position as unknown as THREE.Vector3,
    );
  }
}
