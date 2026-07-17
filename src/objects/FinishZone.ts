import * as THREE from "three";
import { CONFIG } from "../config";
import type { Ball } from "./Ball";
import { createEnergyMaterial, createRoundedBoxGeometry, createSciFiMaterial, getPortalSwirlTexture } from "./visuals";

export interface FinishZoneDef {
  position: [number, number, number];
  size: [number, number, number];
}

export class FinishZone {
  mesh: THREE.Group;
  private box: THREE.Box3;
  private time = 0;
  private discMaterial: THREE.MeshStandardMaterial;
  private swirlMesh: THREE.Mesh;
  private swirlMat: THREE.MeshBasicMaterial;
  private torusMat: THREE.MeshBasicMaterial;
  private beamMat: THREE.MeshBasicMaterial;
  private beamMesh: THREE.Mesh;
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

    const baseY = -h / 2 + 0.3; // top of platform surface

    // Solid bright disc on the ground
    const discGeo = new THREE.CircleGeometry(this.discRadius, 48);
    this.discMaterial = createSciFiMaterial({
      color: 0xffffff,
      emissive: 0xb8ffe6,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      roughness: 0.18,
      metalness: 0.2,
    });
    const disc = new THREE.Mesh(discGeo, this.discMaterial);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = baseY;
    group.add(disc);

    // Swirling vortex on top of the disc
    this.swirlMat = new THREE.MeshBasicMaterial({
      map: getPortalSwirlTexture(),
      color: 0xb8ffe6,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const swirlGeo = new THREE.PlaneGeometry(this.discRadius * 1.95, this.discRadius * 1.95);
    this.swirlMesh = new THREE.Mesh(swirlGeo, this.swirlMat);
    this.swirlMesh.rotation.x = -Math.PI / 2;
    this.swirlMesh.position.y = baseY + 0.02;
    group.add(this.swirlMesh);

    // 3D torus ring — visible from any angle (unlike a flat ring that disappears edge-on)
    this.torusMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });
    const torusGeo = new THREE.TorusGeometry(this.discRadius * 1.02, this.discRadius * 0.06, 12, 64);
    const torus = new THREE.Mesh(torusGeo, this.torusMat);
    torus.rotation.x = Math.PI / 2;
    torus.position.y = baseY + 0.05;
    group.add(torus);

    // Vertical light beam — visible from far away
    this.beamMat = new THREE.MeshBasicMaterial({
      color: 0xb8ffe6,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamHeight = 6;
    const beamGeo = new THREE.CylinderGeometry(this.discRadius * 0.85, this.discRadius * 0.95, beamHeight, 32, 1, true);
    this.beamMesh = new THREE.Mesh(beamGeo, this.beamMat);
    this.beamMesh.position.y = baseY + beamHeight / 2;
    group.add(this.beamMesh);

    this.mesh = group;

    // White swirling particles
    this.particles = this.createParticles(-h / 2 + 0.35);
    group.add(this.particles);
    scene.add(group);

    this.box = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(px, py, pz),
      new THREE.Vector3(w, h, d),
    );
  }

  private createParticles(cy: number): THREE.Points {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * this.discRadius;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = cy + Math.random() * 0.6;
      positions[i * 3 + 2] = Math.sin(angle) * r;

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
    this.discMaterial.emissiveIntensity = 1.0 + Math.sin(this.time * 3) * 0.4;
    this.swirlMesh.rotation.z += dt * 1.4;
    this.swirlMat.opacity = 0.85 + Math.sin(this.time * 3) * 0.12;
    this.beamMat.opacity = 0.28 + Math.sin(this.time * 2.5) * 0.12;
    this.torusMat.opacity = 0.85 + Math.sin(this.time * 3) * 0.15;

    // Spin particles
    const posArr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const cy = -(this.box.max.y - this.box.min.y) / 2 + 0.35;

    for (let i = 0; i < this.particleData.length; i++) {
      const pd = this.particleData[i];
      pd.angle += pd.speed * dt;
      posArr.setXYZ(i,
        Math.cos(pd.angle) * pd.r,
        cy + 0.1 + Math.sin(pd.angle * 2) * 0.3,
        Math.sin(pd.angle) * pd.r,
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
  mesh: THREE.Group;

  constructor(scene: THREE.Scene, position: [number, number, number]) {
    const [px, py, pz] = position;
    this.mesh = new THREE.Group();
    this.mesh.position.set(px, py - CONFIG.ball.radius + 0.025, pz);

    const cold = createEnergyMaterial(CONFIG.colors.pathEdge, 0.82, 1.8);
    const hot = createEnergyMaterial(0xff6a3d, 0.72, 1.4);
    // A flush launch stamp, not a hovering target: three widening bars point
    // down-course and energize the first movement beat.
    const widths = [0.42, 0.72, 1.02];
    for (let i = 0; i < widths.length; i++) {
      const bar = new THREE.Mesh(
        createRoundedBoxGeometry(widths[i], 0.025, 0.09, 0.025, 3),
        i === widths.length - 1 ? hot : cold,
      );
      bar.position.set(0, 0, (i - 1) * 0.24);
      this.mesh.add(bar);
    }
    scene.add(this.mesh);
  }
}
