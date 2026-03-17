import * as THREE from "three";
import { CONFIG } from "../config";
import type { Ball } from "./Ball";

export interface FinishZoneDef {
  position: [number, number, number];
  size: [number, number, number];
}

export class FinishZone {
  mesh: THREE.Group;
  private box: THREE.Box3;
  private time = 0;
  private discMaterial: THREE.MeshStandardMaterial;
  private particles: THREE.Points;
  private particleData: { angle: number; speed: number; r: number }[] = [];
  private center: THREE.Vector3;
  private discRadius: number;

  constructor(scene: THREE.Scene, def: FinishZoneDef) {
    const [w, h, d] = def.size;
    const [px, py, pz] = def.position;

    this.center = new THREE.Vector3(px, py, pz);
    this.discRadius = Math.min(w, d) / 2 * 0.8; // 20% smaller

    const group = new THREE.Group();
    group.position.set(px, py, pz);

    // Solid white disc lying flat on the platform
    const discGeo = new THREE.CircleGeometry(this.discRadius, 32);
    this.discMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const disc = new THREE.Mesh(discGeo, this.discMaterial);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -h / 2 + 0.3; // on top of platform surface (0.25 platform half-height + 0.05 offset)
    group.add(disc);

    // Outer glow ring
    const ringGeo = new THREE.RingGeometry(this.discRadius * 0.9, this.discRadius * 1.1, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -h / 2 + 0.31;
    group.add(ring);

    scene.add(group);
    this.mesh = group;

    // White swirling particles
    this.particles = this.createParticles(px, py - h / 2 + 0.35, pz);
    scene.add(this.particles);

    this.box = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(px, py, pz),
      new THREE.Vector3(w, h, d),
    );
  }

  private createParticles(cx: number, cy: number, cz: number): THREE.Points {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * this.discRadius;
      positions[i * 3] = cx + Math.cos(angle) * r;
      positions[i * 3 + 1] = cy + Math.random() * 0.6;
      positions[i * 3 + 2] = cz + Math.sin(angle) * r;

      // White with slight warm tint
      const t = 0.85 + Math.random() * 0.15;
      colors[i * 3] = t;
      colors[i * 3 + 1] = t;
      colors[i * 3 + 2] = t;

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
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    }));
  }

  update(dt: number) {
    this.time += dt;
    this.discMaterial.emissiveIntensity = 0.5 + Math.sin(this.time * 3) * 0.2;

    // Spin particles
    const posArr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const cx = this.center.x;
    const cy = this.center.y - (this.box.max.y - this.box.min.y) / 2 + 0.35;
    const cz = this.center.z;

    for (let i = 0; i < this.particleData.length; i++) {
      const pd = this.particleData[i];
      pd.angle += pd.speed * dt;
      posArr.setXYZ(i,
        cx + Math.cos(pd.angle) * pd.r,
        cy + 0.1 + Math.sin(pd.angle * 2) * 0.3,
        cz + Math.sin(pd.angle) * pd.r,
      );
    }
    posArr.needsUpdate = true;
  }

  containsBall(ball: Ball): boolean {
    const dx = ball.position.x - this.center.x;
    const dz = ball.position.z - this.center.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    return dist <= this.discRadius;
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
