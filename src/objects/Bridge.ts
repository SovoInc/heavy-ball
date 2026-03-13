import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";

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

    const plankMat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.bridge,
      roughness: 0.75,
      metalness: 0.1,
    });

    const plankCount = Math.floor(length / 0.6);
    const spacing = length / plankCount;
    for (let i = 0; i < plankCount; i++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.1, spacing * 0.85),
        plankMat,
      );
      plank.position.set(0, 0, -length / 2 + spacing * (i + 0.5));
      plank.receiveShadow = true;
      plank.castShadow = true;
      this.mesh.add(plank);
    }

    const railMat = new THREE.MeshStandardMaterial({
      color: 0xccaa77,
      emissive: 0x553311,
      emissiveIntensity: 0.4,
      roughness: 0.5,
      metalness: 0.3,
    });

    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, CONFIG.path.bridgeRailHeight, length),
        railMat,
      );
      rail.position.set(side * width / 2, CONFIG.path.bridgeRailHeight / 2, 0);
      this.mesh.add(rail);

      const postCount = Math.max(2, Math.floor(length / 3));
      const postSpacing = length / (postCount - 1);
      for (let i = 0; i < postCount; i++) {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, CONFIG.path.bridgeRailHeight + 0.1, 0.08),
          railMat,
        );
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
