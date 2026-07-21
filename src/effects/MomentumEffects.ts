import * as THREE from "three";
import type { Ball } from "../objects/Ball";

const COOL = new THREE.Color(0x62d9ff);
const HOT = new THREE.Color(0xff6a3d);

type WakeNode = {
  mesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  position: THREE.Vector3;
};

type Burst = {
  mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  age: number;
  duration: number;
};

export class MomentumEffects {
  private wake: WakeNode[] = [];
  private contactShadow: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  private bursts: Burst[] = [];
  private lastSample = new THREE.Vector3();
  private sampleDistance = 0;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(private scene: THREE.Scene) {
    const wakeGeometry = new THREE.CylinderGeometry(0.045, 0.095, 1, 8, 1, true);
    for (let i = 0; i < 24; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: COOL,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(wakeGeometry, material);
      mesh.visible = false;
      mesh.renderOrder = 4;
      scene.add(mesh);
      this.wake.push({ mesh, position: new THREE.Vector3() });
    }

    this.contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.72, 32),
      new THREE.MeshBasicMaterial({
        color: 0x02040a,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.renderOrder = 2;
    scene.add(this.contactShadow);
  }

  reset(ball: Ball) {
    this.lastSample.copy(ball.mesh.position);
    this.sampleDistance = 0;
    for (const node of this.wake) {
      node.mesh.visible = false;
      node.mesh.material.opacity = 0;
      node.position.copy(ball.mesh.position);
    }
  }

  update(ball: Ball, dt: number, intensity: number) {
    const position = ball.mesh.position;
    const traveled = position.distanceTo(this.lastSample);
    this.sampleDistance += traveled;

    const spacing = THREE.MathUtils.lerp(0.34, 0.16, intensity);
    if (this.sampleDistance >= spacing) {
      for (let i = this.wake.length - 1; i > 0; i--) {
        this.wake[i].position.copy(this.wake[i - 1].position);
      }
      this.wake[0].position.copy(position);
      this.lastSample.copy(position);
      this.sampleDistance = 0;
    }

    const visibleIntensity = intensity < 0.16 ? 0 : (intensity - 0.16) / 0.84;
    const profileColor = new THREE.Color(ball.profile.trail);
    const peakColor = ball.profile.id === "magma"
      ? new THREE.Color(0xffe06a)
      : ball.profile.id === "heavy"
        ? new THREE.Color(0xffffff)
        : ball.profile.id === "light"
          ? new THREE.Color(0xeaffff)
          : HOT;
    const wakeLength = this.reducedMotion ? 8 : this.wake.length;
    for (let i = 0; i < this.wake.length; i++) {
      const node = this.wake[i];
      const life = 1 - i / wakeLength;
      const active = i < wakeLength && life > 0 && visibleIntensity > 0;
      node.mesh.visible = active;
      if (!active) continue;

      const nextPosition = i === 0 ? position : this.wake[i - 1].position;
      const delta = nextPosition.clone().sub(node.position);
      const length = Math.max(0.01, delta.length());
      node.mesh.position.copy(node.position).addScaledVector(delta, 0.5);
      node.mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        delta.normalize(),
      );
      const thickness = (0.45 + life * 0.75) * (0.4 + visibleIntensity * 0.7);
      node.mesh.scale.set(thickness, length, thickness);
      node.mesh.material.color.copy(profileColor).lerp(peakColor, Math.max(0, intensity - 0.58) / 0.42);
      node.mesh.material.opacity = life * visibleIntensity * 0.82;
    }

    this.contactShadow.position.set(position.x, position.y - 0.51, position.z);
    this.contactShadow.scale.setScalar(THREE.MathUtils.lerp(0.82, 1.2, intensity));
    this.contactShadow.material.opacity = THREE.MathUtils.lerp(0.55, 0.22, intensity);

    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const burst = this.bursts[i];
      burst.age += dt;
      const t = Math.min(1, burst.age / burst.duration);
      burst.mesh.scale.setScalar(0.35 + t * 3.2);
      burst.mesh.material.opacity = (1 - t) * 0.9;
      if (t >= 1) {
        this.scene.remove(burst.mesh);
        burst.mesh.geometry.dispose();
        burst.mesh.material.dispose();
        this.bursts.splice(i, 1);
      }
    }
  }

  burst(position: THREE.Vector3, color = 0x62d9ff, strength = 1) {
    if (this.reducedMotion && this.bursts.length > 0) return;
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.38, 36), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(position);
    mesh.position.y -= 0.46;
    mesh.scale.setScalar(Math.max(0.7, strength));
    this.scene.add(mesh);
    this.bursts.push({ mesh, age: 0, duration: 0.42 });
  }

  finish(ball: Ball) {
    this.burst(ball.mesh.position, 0xb9ff5a, 1.8);
  }

  fall() {
    for (const node of this.wake) {
      node.mesh.material.opacity *= 0.15;
    }
  }
}
