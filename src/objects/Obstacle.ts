import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Physics } from "../physics";
import { PowerUpType } from "../powerups/PowerUpType";
import { CONFIG } from "../config";

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
  powerUp?: PowerUpType;
}

const POWER_UP_COLOR_MAP: Record<PowerUpType, number> = {
  [PowerUpType.TimeBonus]: CONFIG.powerUp.colors.timeBonus,
  [PowerUpType.SpeedBoost]: CONFIG.powerUp.colors.speedBoost,
  [PowerUpType.Shield]: CONFIG.powerUp.colors.shield,
  [PowerUpType.TimeFreeze]: CONFIG.powerUp.colors.timeFreeze,
};

export class Obstacle {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  breakable: boolean;
  destroyed = false;
  color: number;
  size: [number, number, number];
  powerUpType?: PowerUpType;
  private movingDef?: ObstacleDef["moving"];
  private origin: [number, number, number];
  private time = 0;
  private material: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene, physics: Physics, def: ObstacleDef) {
    const [w, h, d] = def.size;
    const [px, py, pz] = def.position;
    this.origin = [px, py, pz];
    this.movingDef = def.moving;
    this.breakable = def.breakable ?? false;
    this.powerUpType = def.powerUp;

    const baseColor = def.powerUp
      ? POWER_UP_COLOR_MAP[def.powerUp]
      : (def.color ?? 0x665544);
    this.color = baseColor;
    this.size = def.size;

    const geo = new THREE.BoxGeometry(w, h, d);
    this.material = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: def.powerUp ? 0.3 : 0.7,
      metalness: def.powerUp ? 0.5 : 0.2,
      emissive: def.powerUp ? baseColor : 0x000000,
      emissiveIntensity: def.powerUp ? 0.3 : 0,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
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

  restore(scene: THREE.Scene, physics: Physics) {
    if (!this.destroyed) return;
    this.destroyed = false;
    this.time = 0;
    const [px, py, pz] = this.origin;
    this.mesh.position.set(px, py, pz);
    this.body.position.set(px, py, pz);
    scene.add(this.mesh);
    physics.addBody(this.body);
  }

  update(dt: number) {
    this.time += dt;

    if (this.movingDef) {
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

    // Pulsing glow for power-up boxes
    if (this.powerUpType) {
      this.material.emissiveIntensity = 0.3 + Math.sin(this.time * 4) * 0.2;
    }
  }
}
