import * as THREE from "three";

type Flame = {
  x: number;
  z: number;
  phase: number;
  speed: number;
  height: number;
  width: number;
};

export class FlameField {
  readonly mesh: THREE.InstancedMesh;
  private flames: Flame[];
  private dummy = new THREE.Object3D();
  private time = 0;

  constructor(positions: Array<{ x: number; z: number }>, private topY: number) {
    this.flames = positions.map(({ x, z }) => ({
      x,
      z,
      phase: Math.random() * Math.PI * 2,
      speed: 5 + Math.random() * 4,
      height: 0.55 + Math.random() * 0.72,
      width: 0.12 + Math.random() * 0.13,
    }));

    const geometry = new THREE.ConeGeometry(1, 1, 7, 1, true);
    geometry.translate(0, 0.5, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.InstancedMesh(geometry, material, this.flames.length);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    for (let i = 0; i < this.flames.length; i++) {
      const warmth = Math.random();
      this.mesh.setColorAt(i, new THREE.Color().setRGB(1, 0.2 + warmth * 0.55, warmth * 0.08));
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.update(0);
  }

  update(dt: number) {
    this.time += dt;
    for (let i = 0; i < this.flames.length; i++) {
      const flame = this.flames[i];
      const flicker = 0.76
        + Math.sin(this.time * flame.speed + flame.phase) * 0.18
        + Math.sin(this.time * flame.speed * 1.73 + flame.phase * 0.6) * 0.08;
      const height = flame.height * flicker;
      const leanX = Math.sin(this.time * 3.2 + flame.phase) * 0.12;
      const leanZ = Math.cos(this.time * 2.7 + flame.phase * 1.3) * 0.1;

      this.dummy.position.set(flame.x + leanX * 0.2, this.topY, flame.z + leanZ * 0.2);
      this.dummy.rotation.set(leanZ, 0, -leanX);
      this.dummy.scale.set(flame.width * flicker, height, flame.width * flicker);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
