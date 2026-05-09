import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";
import { createRoundedBar, createRoundedBoxGeometry, createSciFiMaterial } from "./visuals";

export interface BridgeDef {
  position: [number, number, number];
  width: number;
  length: number;
  rotation?: number;
}

export class Bridge {
  mesh: THREE.Group;
  body: CANNON.Body;

  constructor(scene: THREE.Scene, physics: Physics, def: BridgeDef) {
    const { position, width, length, rotation = 0 } = def;
    const [px, py, pz] = position;
    const h = 0.5;

    this.mesh = new THREE.Group();

    const plankMat = createSciFiMaterial({
      color: CONFIG.colors.bridge,
      emissive: 0x2a1a08,
      emissiveIntensity: 0.16,
      roughness: 0.52,
      metalness: 0.32,
    });

    const plankCount = Math.floor(length / 0.6);
    const spacing = length / plankCount;
    for (let i = 0; i < plankCount; i++) {
      const plank = new THREE.Mesh(
        createRoundedBoxGeometry(width, 0.1, spacing * 0.85, 0.08, 4),
        plankMat,
      );
      plank.position.set(0, 0, -length / 2 + spacing * (i + 0.5));
      plank.receiveShadow = true;
      plank.castShadow = true;
      this.mesh.add(plank);
    }

    const railMat = createSciFiMaterial({
      color: 0xd8b778,
      emissive: 0x6a4312,
      emissiveIntensity: 0.42,
      roughness: 0.38,
      metalness: 0.5,
    });

    for (const side of [-1, 1]) {
      const rail = createRoundedBar(0.08, CONFIG.path.bridgeRailHeight, length, railMat, 0.04);
      rail.position.set(side * width / 2, CONFIG.path.bridgeRailHeight / 2, 0);
      this.mesh.add(rail);

      const postCount = Math.max(2, Math.floor(length / 3));
      const postSpacing = length / (postCount - 1);
      for (let i = 0; i < postCount; i++) {
        const post = createRoundedBar(0.1, CONFIG.path.bridgeRailHeight + 0.12, 0.1, railMat, 0.045);
        post.position.set(
          side * width / 2,
          CONFIG.path.bridgeRailHeight / 2,
          -length / 2 + postSpacing * i,
        );
        post.castShadow = true;
        this.mesh.add(post);
      }
    }

    this.mesh.position.set(px, py, pz);
    this.mesh.rotation.y = rotation;
    scene.add(this.mesh);

    // Use thicker collision box to prevent tunneling (cannon-es has no CCD)
    const collisionH = Math.max(h, 2);
    this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, collisionH / 2, length / 2)),
      material: physics.groundMaterial,
    });
    this.body.position.set(px, py - (collisionH - h) / 2, pz);
    if (rotation) this.body.quaternion.setFromEuler(0, rotation, 0);
    physics.addBody(this.body);
  }
}
