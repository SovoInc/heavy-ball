import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Physics } from "../physics";

export interface TimedGateDef {
  position: [number, number, number];
  size: [number, number, number];
  onTime: number;
  offTime: number;
}

export class TimedGate {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  private onTime: number;
  private offTime: number;
  private timer = 0;
  private active = true;
  private material: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene, physics: Physics, def: TimedGateDef) {
    const [w, h, d] = def.size;
    const [px, py, pz] = def.position;
    this.onTime = def.onTime;
    this.offTime = def.offTime;

    const geo = new THREE.BoxGeometry(w, h, d);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xcc4444,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
      emissive: 0xcc4444,
      emissiveIntensity: 0.2,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(px, py, pz);
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)),
      material: physics.wallMaterial,
      type: CANNON.Body.STATIC,
    });
    this.body.position.set(px, py, pz);
    physics.addBody(this.body);
  }

  update(dt: number, physics: Physics) {
    this.timer += dt;
    const cycle = this.onTime + this.offTime;
    const phase = this.timer % cycle;

    const shouldBeActive = phase < this.onTime;
    if (shouldBeActive !== this.active) {
      this.active = shouldBeActive;
      if (this.active) {
        this.mesh.visible = true;
        this.material.opacity = 0.9;
        physics.addBody(this.body);
      } else {
        this.mesh.visible = false;
        physics.removeBody(this.body);
      }
    }

    // Flicker warning before toggle
    if (this.active && (this.onTime - phase) < 0.5) {
      this.material.opacity = 0.4 + Math.sin(this.timer * 20) * 0.3;
    }
  }
}
