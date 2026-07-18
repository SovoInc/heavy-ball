import * as THREE from "three";
import { SurfaceType } from "../objects/Path";

type Particle = {
  active: boolean;
  age: number;
  lifetime: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
};

type Mark = {
  mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  age: number;
  lifetime: number;
  baseScale: number;
};

const SURFACE_COLOR: Record<SurfaceType, number> = {
  [SurfaceType.Normal]: 0x9ee8ff,
  [SurfaceType.Ice]: 0xc8f7ff,
  [SurfaceType.Lava]: 0xff5a1f,
  [SurfaceType.Bounce]: 0xb9ff5a,
  [SurfaceType.Speed]: 0x62d9ff,
  [SurfaceType.Crumbling]: 0xffc46b,
  [SurfaceType.Magnet]: 0xc267ff,
  [SurfaceType.Invisible]: 0xd9e7ff,
};

/** Pooled, surface-aware contact evidence: fragments, fading marks and light waves. */
export class ContactEffects {
  private readonly count: number;
  private particles: Particle[] = [];
  private instances: THREE.InstancedMesh;
  private marks: Mark[] = [];
  private cursor = 0;
  private dummy = new THREE.Object3D();
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(private scene: THREE.Scene) {
    this.count = this.reducedMotion ? 36 : 96;
    const geometry = new THREE.TetrahedronGeometry(0.075, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.instances = new THREE.InstancedMesh(geometry, material, this.count);
    this.instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instances.frustumCulled = false;
    this.instances.renderOrder = 7;
    scene.add(this.instances);

    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        active: false,
        age: 0,
        lifetime: 1,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        spin: new THREE.Vector3(),
      });
      this.hideInstance(i);
    }
    this.instances.instanceMatrix.needsUpdate = true;
  }

  impact(position: THREE.Vector3, surface: SurfaceType | null, energy: number) {
    const type = surface ?? SurfaceType.Normal;
    const strength = THREE.MathUtils.clamp(energy / 9, 0.35, 1.35);
    const color = new THREE.Color(SURFACE_COLOR[type]);
    const amount = Math.round((this.reducedMotion ? 4 : 9) + strength * (this.reducedMotion ? 3 : 9));

    for (let n = 0; n < amount; n++) {
      const index = this.cursor++ % this.count;
      const particle = this.particles[index];
      const angle = Math.random() * Math.PI * 2;
      const lateral = (1.4 + Math.random() * 3.4) * strength;
      particle.active = true;
      particle.age = 0;
      particle.lifetime = 0.32 + Math.random() * 0.48;
      particle.position.copy(position).add(new THREE.Vector3(0, -0.42, 0));
      particle.velocity.set(
        Math.cos(angle) * lateral,
        type === SurfaceType.Ice ? 1.2 + Math.random() * 2.4 : 2 + Math.random() * 3.8,
        Math.sin(angle) * lateral,
      );
      if (type === SurfaceType.Lava) particle.velocity.y += 2.2;
      particle.spin.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      this.instances.setColorAt(index, color.clone().lerp(new THREE.Color(0xffffff), Math.random() * 0.45));
    }
    if (this.instances.instanceColor) this.instances.instanceColor.needsUpdate = true;
    this.addMark(position, color, type, strength);
  }

  nearMiss(position: THREE.Vector3) {
    this.addMark(position, new THREE.Color(0xffd18a), SurfaceType.Normal, 0.55, 0.32);
  }

  update(dt: number) {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      if (!particle.active) continue;
      particle.age += dt;
      if (particle.age >= particle.lifetime) {
        particle.active = false;
        this.hideInstance(i);
        continue;
      }
      const life = 1 - particle.age / particle.lifetime;
      particle.velocity.y -= 12 * dt;
      particle.position.addScaledVector(particle.velocity, dt);
      this.dummy.position.copy(particle.position);
      this.dummy.rotation.x += particle.spin.x * dt;
      this.dummy.rotation.y += particle.spin.y * dt;
      this.dummy.rotation.z += particle.spin.z * dt;
      this.dummy.scale.setScalar(Math.max(0.01, life * (0.7 + life * 0.8)));
      this.dummy.updateMatrix();
      this.instances.setMatrixAt(i, this.dummy.matrix);
    }
    this.instances.instanceMatrix.needsUpdate = true;

    for (let i = this.marks.length - 1; i >= 0; i--) {
      const mark = this.marks[i];
      mark.age += dt;
      const t = Math.min(1, mark.age / mark.lifetime);
      mark.mesh.material.opacity = (1 - t) * 0.7;
      mark.mesh.scale.setScalar(mark.baseScale * THREE.MathUtils.lerp(1, 1.65, t));
      if (t >= 1) {
        this.scene.remove(mark.mesh);
        mark.mesh.geometry.dispose();
        mark.mesh.material.dispose();
        this.marks.splice(i, 1);
      }
    }
  }

  reset() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].active = false;
      this.hideInstance(i);
    }
    for (const mark of this.marks) {
      this.scene.remove(mark.mesh);
      mark.mesh.geometry.dispose();
      mark.mesh.material.dispose();
    }
    this.marks = [];
    this.instances.instanceMatrix.needsUpdate = true;
  }

  private addMark(
    position: THREE.Vector3,
    color: THREE.Color,
    type: SurfaceType,
    strength: number,
    lifetime = 2.4,
  ) {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: type === SurfaceType.Lava ? 0.58 : 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.28, 28), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(position);
    mesh.position.y -= 0.485;
    const baseScale = 0.58 + strength * 0.32;
    mesh.scale.setScalar(baseScale);
    mesh.renderOrder = 6;
    this.scene.add(mesh);
    this.marks.push({ mesh, age: 0, lifetime, baseScale });
    while (this.marks.length > 22) {
      const old = this.marks.shift()!;
      this.scene.remove(old.mesh);
      old.mesh.geometry.dispose();
      old.mesh.material.dispose();
    }
  }

  private hideInstance(index: number) {
    this.dummy.position.set(0, -1000, 0);
    this.dummy.scale.setScalar(0.001);
    this.dummy.updateMatrix();
    this.instances.setMatrixAt(index, this.dummy.matrix);
  }
}
