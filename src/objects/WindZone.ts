import * as THREE from "three";
import * as CANNON from "cannon-es";
import type { Ball } from "./Ball";

export interface WindZoneDef {
  position: [number, number, number];
  size: [number, number, number];
  direction: [number, number, number];
  strength: number;
}

export class WindZone {
  private min: THREE.Vector3;
  private max: THREE.Vector3;
  private force: CANNON.Vec3;
  mesh: THREE.Mesh;

  constructor(scene: THREE.Scene, def: WindZoneDef) {
    const [px, py, pz] = def.position;
    const [sx, sy, sz] = def.size;

    this.min = new THREE.Vector3(px - sx / 2, py - sy / 2, pz - sz / 2);
    this.max = new THREE.Vector3(px + sx / 2, py + sy / 2, pz + sz / 2);

    const [dx, dy, dz] = def.direction;
    this.force = new CANNON.Vec3(
      dx * def.strength,
      dy * def.strength,
      dz * def.strength,
    );

    // Semi-transparent visual indicator
    const geo = new THREE.BoxGeometry(sx, sy, sz);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.08,
      emissive: 0x88ccff,
      emissiveIntensity: 0.15,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(px, py, pz);
    scene.add(this.mesh);
  }

  applyForce(ball: Ball) {
    const p = ball.position;
    if (
      p.x >= this.min.x && p.x <= this.max.x &&
      p.y >= this.min.y && p.y <= this.max.y &&
      p.z >= this.min.z && p.z <= this.max.z
    ) {
      ball.body.applyForce(this.force, ball.body.position);
    }
  }
}
