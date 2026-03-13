import * as THREE from "three";
import { CONFIG } from "../config";

const { debrisCount, debrisLifetime, debrisSpeed, debrisGravity, debrisSize } =
  CONFIG.breakable;

interface Chunk {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
}

export class Debris {
  private chunks: Chunk[] = [];
  private elapsed = 0;
  private material: THREE.MeshStandardMaterial;
  private geometry: THREE.BoxGeometry;

  constructor(
    private scene: THREE.Scene,
    position: THREE.Vector3,
    color: number,
    obstacleSize: [number, number, number],
  ) {
    const s = debrisSize;
    this.geometry = new THREE.BoxGeometry(s, s, s);
    this.material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      transparent: true,
    });

    const spread = Math.max(...obstacleSize) * 0.3;

    for (let i = 0; i < debrisCount; i++) {
      const mesh = new THREE.Mesh(this.geometry, this.material.clone());
      mesh.position.set(
        position.x + (Math.random() - 0.5) * spread,
        position.y + (Math.random() - 0.5) * spread,
        position.z + (Math.random() - 0.5) * spread,
      );
      mesh.castShadow = true;
      scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const upBias = 0.5 + Math.random() * 0.5;
      this.chunks.push({
        mesh,
        vx: Math.cos(angle) * debrisSpeed * (0.5 + Math.random() * 0.5),
        vy: upBias * debrisSpeed,
        vz: Math.sin(angle) * debrisSpeed * (0.5 + Math.random() * 0.5),
        rx: (Math.random() - 0.5) * 10,
        ry: (Math.random() - 0.5) * 10,
        rz: (Math.random() - 0.5) * 10,
      });
    }
  }

  update(dt: number): boolean {
    this.elapsed += dt;
    if (this.elapsed >= debrisLifetime) return false;

    const t = this.elapsed / debrisLifetime;
    const opacity = 1 - t;

    for (const chunk of this.chunks) {
      chunk.vy += debrisGravity * dt;
      chunk.mesh.position.x += chunk.vx * dt;
      chunk.mesh.position.y += chunk.vy * dt;
      chunk.mesh.position.z += chunk.vz * dt;
      chunk.mesh.rotation.x += chunk.rx * dt;
      chunk.mesh.rotation.y += chunk.ry * dt;
      chunk.mesh.rotation.z += chunk.rz * dt;
      (chunk.mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
    }

    return true;
  }

  destroy() {
    for (const chunk of this.chunks) {
      this.scene.remove(chunk.mesh);
      (chunk.mesh.material as THREE.MeshStandardMaterial).dispose();
    }
    this.geometry.dispose();
    this.material.dispose();
    this.chunks = [];
  }
}
