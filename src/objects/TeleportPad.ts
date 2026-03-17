import * as THREE from "three";
import { CONFIG } from "../config";

export interface TeleportPairDef {
  a: [number, number, number]; // position of pad A (on a platform surface)
  b: [number, number, number]; // position of pad B (on a platform surface)
  radius?: number;             // trigger radius (default 1.5)
}

export class TeleportPad {
  meshA: THREE.Group;
  meshB: THREE.Group;
  posA: THREE.Vector3;
  posB: THREE.Vector3;
  radius: number;

  sceneObjects: THREE.Object3D[] = [];

  private animTime = 0;
  private matA: THREE.MeshStandardMaterial;
  private matB: THREE.MeshStandardMaterial;
  private particlesA: THREE.Points;
  private particlesB: THREE.Points;
  private particleData: { angle: number; speed: number; r: number }[] = [];

  constructor(scene: THREE.Scene, def: TeleportPairDef) {
    this.posA = new THREE.Vector3(...def.a);
    this.posB = new THREE.Vector3(...def.b);
    this.radius = def.radius ?? 1.5;

    const color = CONFIG.surfaces.teleport.color;
    const emissive = CONFIG.surfaces.teleport.emissive;

    this.matA = this.createMaterial(color, emissive);
    this.matB = this.createMaterial(color, emissive);

    this.meshA = this.createPadMesh(this.posA, this.matA);
    this.meshB = this.createPadMesh(this.posB, this.matB);

    this.particlesA = this.createParticles(this.posA);
    this.particlesB = this.createParticles(this.posB);

    scene.add(this.meshA);
    scene.add(this.meshB);
    scene.add(this.particlesA);
    scene.add(this.particlesB);
    this.sceneObjects.push(this.meshA, this.meshB, this.particlesA, this.particlesB);
  }

  private createMaterial(color: number, emissive: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.5,
    });
  }

  private createPadMesh(pos: THREE.Vector3, mat: THREE.MeshStandardMaterial): THREE.Group {
    const group = new THREE.Group();

    // Outer ring
    const ringGeo = new THREE.RingGeometry(this.radius * 0.6, this.radius, 32);
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos.x, pos.y + 0.05, pos.z);
    group.add(ring);

    // Inner disc
    const discGeo = new THREE.CircleGeometry(this.radius * 0.4, 24);
    const discMat = mat.clone();
    discMat.emissiveIntensity = 1.0;
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(pos.x, pos.y + 0.06, pos.z);
    group.add(disc);

    return group;
  }

  private createParticles(pos: THREE.Vector3): THREE.Points {
    const count = 20;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * this.radius;
      positions[i * 3] = pos.x + Math.cos(angle) * r;
      positions[i * 3 + 1] = pos.y + 0.1 + Math.random() * 0.5;
      positions[i * 3 + 2] = pos.z + Math.sin(angle) * r;

      const t = Math.random();
      colors[i * 3] = 0.5 + t * 0.3;
      colors[i * 3 + 1] = 0.2 + t * 0.2;
      colors[i * 3 + 2] = 0.8 + t * 0.2;

      this.particleData.push({
        angle,
        speed: 1 + Math.random() * 2,
        r,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    }));
  }

  update(dt: number) {
    this.animTime += dt;
    const pulse = 0.4 + Math.sin(this.animTime * 4) * 0.3;
    this.matA.emissiveIntensity = pulse;
    this.matB.emissiveIntensity = pulse;

    // Spin particles around each pad
    for (const [particles, pos] of [[this.particlesA, this.posA], [this.particlesB, this.posB]] as const) {
      const posArr = particles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.particleData.length; i++) {
        const pd = this.particleData[i];
        pd.angle += pd.speed * dt;
        posArr.setXYZ(i,
          pos.x + Math.cos(pd.angle) * pd.r,
          pos.y + 0.1 + Math.sin(pd.angle * 2) * 0.25,
          pos.z + Math.sin(pd.angle) * pd.r,
        );
      }
      posArr.needsUpdate = true;
    }
  }

  /** Check if ball is on pad A, return 'a'. On pad B, return 'b'. Otherwise null. */
  checkBall(bx: number, bz: number): "a" | "b" | null {
    const dxA = bx - this.posA.x;
    const dzA = bz - this.posA.z;
    if (dxA * dxA + dzA * dzA <= this.radius * this.radius) return "a";

    const dxB = bx - this.posB.x;
    const dzB = bz - this.posB.z;
    if (dxB * dxB + dzB * dzB <= this.radius * this.radius) return "b";

    return null;
  }

  getDestination(side: "a" | "b"): THREE.Vector3 {
    return side === "a" ? this.posB : this.posA;
  }
}
