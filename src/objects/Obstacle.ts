import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Physics } from "../physics";
import { PowerUpType } from "../powerups/PowerUpType";
import { CONFIG } from "../config";
import {
  createEnergyMaterial,
  createRoundedBar,
  createRoundedBoxGeometry,
  createRoundedPanel,
  createSciFiMaterial,
} from "./visuals";

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
  private glowMaterial: THREE.MeshStandardMaterial | null = null;

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

    const geo = createRoundedBoxGeometry(w, h, d, Math.min(0.16, w * 0.16, h * 0.16, d * 0.16), 5);
    this.material = createSciFiMaterial({
      color: baseColor,
      roughness: def.powerUp ? 0.26 : 0.5,
      metalness: def.powerUp ? 0.55 : 0.32,
      emissive: def.powerUp ? baseColor : 0x000000,
      emissiveIntensity: def.powerUp ? 0.3 : 0,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(px, py, pz);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    if (def.rotation) this.mesh.rotation.y = def.rotation;
    this.addVisualDetails(w, h, d, baseColor, !!def.powerUp);
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
      const pulse = 0.3 + Math.sin(this.time * 4) * 0.2;
      this.material.emissiveIntensity = pulse;
      if (this.glowMaterial) this.glowMaterial.emissiveIntensity = 0.8 + Math.sin(this.time * 4) * 0.35;
    }
  }

  private addVisualDetails(w: number, h: number, d: number, color: number, isPowerUp: boolean) {
    const panel = createRoundedPanel(
      Math.max(0.2, w * 0.72),
      Math.max(0.2, d * 0.72),
      new THREE.Color(color).lerp(new THREE.Color(0xffffff), isPowerUp ? 0.24 : 0.12).getHex(),
      isPowerUp ? color : 0x000000,
      isPowerUp ? 0.78 : 0.55,
    );
    panel.position.y = h / 2 + 0.018;
    this.mesh.add(panel);

    const bandMat = createSciFiMaterial({
      color: isPowerUp ? color : 0x8a7764,
      emissive: isPowerUp ? color : 0x120c08,
      emissiveIntensity: isPowerUp ? 0.55 : 0.18,
      roughness: 0.38,
      metalness: 0.45,
    });
    const band = createRoundedBar(Math.max(0.25, w * 0.82), 0.045, Math.max(0.05, d * 0.08), bandMat, 0.025);
    band.position.set(0, h * 0.08, d / 2 + 0.012);
    this.mesh.add(band);

    if (isPowerUp) {
      this.glowMaterial = createEnergyMaterial(color, 0.35, 0.9);
      const glow = new THREE.Mesh(
        new THREE.RingGeometry(Math.min(w, d) * 0.22, Math.min(w, d) * 0.34, 40),
        this.glowMaterial,
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = h / 2 + 0.045;
      this.mesh.add(glow);
    }
  }
}
