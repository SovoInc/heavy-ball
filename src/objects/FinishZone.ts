import * as THREE from "three";
import { CONFIG } from "../config";
import type { Ball } from "./Ball";

export interface FinishZoneDef {
  position: [number, number, number];
  size: [number, number, number];
}

export class FinishZone {
  mesh: THREE.Mesh;
  private box: THREE.Box3;
  private time = 0;

  constructor(scene: THREE.Scene, def: FinishZoneDef) {
    const [w, h, d] = def.size;
    const [px, py, pz] = def.position;

    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.finishZone,
      transparent: true,
      opacity: 0.3,
      emissive: CONFIG.colors.finishZone,
      emissiveIntensity: 0.5,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(px, py, pz);
    scene.add(this.mesh);

    this.box = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(px, py, pz),
      new THREE.Vector3(w, h, d),
    );
  }

  update(dt: number) {
    this.time += dt;
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(this.time * 3) * 0.2;
  }

  containsBall(ball: Ball): boolean {
    const p = new THREE.Vector3(
      ball.position.x,
      ball.position.y,
      ball.position.z,
    );
    return this.box.containsPoint(p);
  }
}

export class StartMarker {
  mesh: THREE.Mesh;

  constructor(scene: THREE.Scene, position: [number, number, number]) {
    const [px, py, pz] = position;
    const geo = new THREE.RingGeometry(0.8, 1.2, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.startZone,
      emissive: CONFIG.colors.startZone,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(px, py + 0.01, pz);
    this.mesh.rotation.x = -Math.PI / 2;
    scene.add(this.mesh);
  }
}
