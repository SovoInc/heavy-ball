import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Physics } from "../physics";
import { createEnergyMaterial, createRoundedBar, createRoundedBoxGeometry, createSciFiMaterial } from "./visuals";

export interface TimedGateDef {
  position: [number, number, number];
  size: [number, number, number];
  onTime: number;
  offTime: number;
}

export class TimedGate {
  mesh: THREE.Group;
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

    this.mesh = new THREE.Group();
    this.mesh.position.set(px, py, pz);
    this.material = createEnergyMaterial(0xff5a5a, 0.48, 0.75);
    const barrier = new THREE.Mesh(
      createRoundedBoxGeometry(w, h, d, Math.min(0.14, w * 0.1, h * 0.05, d * 0.1), 4),
      this.material,
    );
    barrier.castShadow = true;
    this.mesh.add(barrier);

    const postMat = createSciFiMaterial({
      color: 0x4a2528,
      emissive: 0xff3838,
      emissiveIntensity: 0.32,
      roughness: 0.35,
      metalness: 0.58,
    });
    if (w >= d) {
      for (const sign of [-1, 1]) {
        const post = createRoundedBar(0.16, h + 0.25, Math.max(0.2, d + 0.16), postMat, 0.06);
        post.position.x = sign * w / 2;
        this.mesh.add(post);
      }
    } else {
      for (const sign of [-1, 1]) {
        const post = createRoundedBar(Math.max(0.2, w + 0.16), h + 0.25, 0.16, postMat, 0.06);
        post.position.z = sign * d / 2;
        this.mesh.add(post);
      }
    }
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
    } else if (this.active) {
      this.material.opacity = 0.48;
    }
    this.material.emissiveIntensity = 0.55 + Math.sin(this.timer * 5) * 0.18;
  }
}
