import * as THREE from "three";
import { CONFIG } from "../config";
import { createEnergyMaterial, createRingMesh, getPortalSwirlTexture } from "./visuals";

export interface TeleportPairDef {
  a: [number, number, number]; // position of pad A (on a platform surface)
  b: [number, number, number]; // position of pad B (on a platform surface)
  radius?: number;             // trigger radius (default 1.5)
}

interface PortalSide {
  group: THREE.Group;
  pos: THREE.Vector3;
  ringMat: THREE.MeshStandardMaterial;
  swirlMat: THREE.MeshBasicMaterial;
  swirlMesh: THREE.Mesh;
  haloMat: THREE.MeshBasicMaterial;
  particles: THREE.Points;
  particleData: { angle: number; r: number; rTarget: number; speed: number; yOff: number; ySpeed: number }[];
}

export class TeleportPad {
  meshA: THREE.Group;
  meshB: THREE.Group;
  posA: THREE.Vector3;
  posB: THREE.Vector3;
  radius: number;

  sceneObjects: THREE.Object3D[] = [];

  private animTime = 0;
  private sideA: PortalSide;
  private sideB: PortalSide;

  constructor(scene: THREE.Scene, def: TeleportPairDef) {
    this.posA = new THREE.Vector3(...def.a);
    this.posB = new THREE.Vector3(...def.b);
    this.radius = def.radius ?? 1.5;

    this.sideA = this.buildSide(this.posA);
    this.sideB = this.buildSide(this.posB);

    this.meshA = this.sideA.group;
    this.meshB = this.sideB.group;

    scene.add(this.meshA);
    scene.add(this.meshB);
    scene.add(this.sideA.particles);
    scene.add(this.sideB.particles);
    this.sceneObjects.push(this.meshA, this.meshB, this.sideA.particles, this.sideB.particles);
  }

  private buildSide(pos: THREE.Vector3): PortalSide {
    const group = new THREE.Group();
    const color = CONFIG.surfaces.teleport.color;
    const emissive = CONFIG.surfaces.teleport.emissive;

    // Outer ring — bright energy frame
    const ringMat = createEnergyMaterial(color, 0.85, 1.4);
    const ring = createRingMesh(this.radius * 0.78, this.radius, ringMat, 64);
    ring.position.set(pos.x, pos.y + 0.06, pos.z);
    group.add(ring);

    // Outer rail glow
    const rail = createRingMesh(this.radius * 1.05, this.radius * 1.18, createEnergyMaterial(0xcaa0ff, 0.45, 0.9), 64);
    rail.position.set(pos.x, pos.y + 0.052, pos.z);
    group.add(rail);

    // Swirling vortex disc inside the ring
    const swirlMat = new THREE.MeshBasicMaterial({
      map: getPortalSwirlTexture(),
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const swirlGeo = new THREE.PlaneGeometry(this.radius * 1.6, this.radius * 1.6);
    const swirlMesh = new THREE.Mesh(swirlGeo, swirlMat);
    swirlMesh.rotation.x = -Math.PI / 2;
    swirlMesh.position.set(pos.x, pos.y + 0.07, pos.z);
    group.add(swirlMesh);

    // Soft halo above the portal — gives a sense of depth
    const haloMat = new THREE.MeshBasicMaterial({
      map: getPortalSwirlTexture(),
      color: 0xd5b8ff,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const haloGeo = new THREE.PlaneGeometry(this.radius * 2.4, this.radius * 2.4);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(pos.x, pos.y + 0.09, pos.z);
    group.add(halo);

    // Inner bright disc — concentrated emissive core
    const discGeo = new THREE.CircleGeometry(this.radius * 0.28, 32);
    const discMat = createEnergyMaterial(color, 0.9, 2.0);
    discMat.emissive = new THREE.Color(emissive);
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(pos.x, pos.y + 0.08, pos.z);
    group.add(disc);

    // Particles spiraling inward and rising in a column
    const count = 60;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const data: PortalSide["particleData"] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rTarget = 0.1 + Math.random() * (this.radius * 0.95);
      const r = rTarget;
      const yOff = Math.random() * 2.2;
      positions[i * 3] = pos.x + Math.cos(angle) * r;
      positions[i * 3 + 1] = pos.y + 0.1 + yOff;
      positions[i * 3 + 2] = pos.z + Math.sin(angle) * r;

      const t = Math.random();
      colors[i * 3] = 0.7 + t * 0.3;
      colors[i * 3 + 1] = 0.55 + t * 0.35;
      colors[i * 3 + 2] = 1;

      data.push({
        angle,
        r,
        rTarget,
        speed: 1.6 + Math.random() * 2.4,
        yOff,
        ySpeed: 0.9 + Math.random() * 1.4,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(geo, particleMat);

    return {
      group,
      pos,
      ringMat,
      swirlMat,
      swirlMesh,
      haloMat,
      particles,
      particleData: data,
    };
  }

  update(dt: number) {
    this.animTime += dt;
    const pulse = 0.8 + Math.sin(this.animTime * 4) * 0.4;

    for (const side of [this.sideA, this.sideB]) {
      side.ringMat.emissiveIntensity = pulse;
      // Spin the swirl in opposite direction to the halo for parallax
      side.swirlMesh.rotation.z += dt * 1.6;
      side.swirlMat.opacity = 0.85 + Math.sin(this.animTime * 3) * 0.12;
      side.haloMat.opacity = 0.28 + Math.sin(this.animTime * 2.2) * 0.12;

      const posArr = side.particles.geometry.attributes.position as THREE.BufferAttribute;
      const colArr = side.particles.geometry.attributes.color as THREE.BufferAttribute;
      for (let i = 0; i < side.particleData.length; i++) {
        const pd = side.particleData[i];
        pd.angle += pd.speed * dt;
        pd.yOff += pd.ySpeed * dt;
        // Spiral inward slowly, reset radius when too small
        pd.r -= dt * 0.35;
        if (pd.r < 0.08) {
          pd.r = this.radius * (0.4 + Math.random() * 0.6);
          pd.yOff = 0;
          pd.angle = Math.random() * Math.PI * 2;
        }
        if (pd.yOff > 2.4) {
          pd.yOff = 0;
          pd.r = this.radius * (0.4 + Math.random() * 0.6);
        }

        const x = side.pos.x + Math.cos(pd.angle) * pd.r;
        const z = side.pos.z + Math.sin(pd.angle) * pd.r;
        const y = side.pos.y + 0.1 + pd.yOff;
        posArr.setXYZ(i, x, y, z);

        // Fade as particle rises and approaches the center
        const heightFade = Math.max(0, 1 - pd.yOff / 2.4);
        const intensity = heightFade;
        colArr.setXYZ(i, 0.75 * intensity + 0.1, 0.55 * intensity + 0.1, 1 * intensity);
      }
      posArr.needsUpdate = true;
      colArr.needsUpdate = true;
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
