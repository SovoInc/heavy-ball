import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";

export class Ball {
  mesh: THREE.Mesh;
  body: CANNON.Body;

  constructor(scene: THREE.Scene, physics: Physics) {
    const { radius, mass, linearDamping, angularDamping } = CONFIG.ball;

    const geo = new THREE.SphereGeometry(radius, 64, 64);
    const texture = Ball.createLogoTexture();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4,
      map: texture,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass,
      shape: new CANNON.Sphere(radius),
      material: physics.ballMaterial,
      linearDamping,
      angularDamping,
    });
    physics.addBody(this.body);
  }

  setPosition(x: number, y: number, z: number) {
    this.body.position.set(x, y, z);
    this.body.velocity.setZero();
    this.body.angularVelocity.setZero();
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.syncMesh();
  }

  syncMesh() {
    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(
      this.body.quaternion as unknown as THREE.Quaternion,
    );
  }

  get position(): CANNON.Vec3 {
    return this.body.position;
  }

  get speed(): number {
    return this.body.velocity.length();
  }

  /**
   * Draw the midnight logo procedurally onto a canvas texture.
   * Uses equirectangular projection math so circles appear round on the sphere.
   */
  private static createLogoTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const c = canvas.getContext("2d")!;

    // Black base
    c.fillStyle = "#111111";
    c.fillRect(0, 0, size, size);

    // Three white squares in a vertical line.
    // Sphere UV: width = 2π, height = π. At latitude θ, one horizontal pixel
    // covers (2π/size)*cos(θ) surface distance, one vertical pixel covers π/size.
    // To get equal angular size: sqW = sqH * (π/size) / ((2π/size)*cos(θ)) = sqH / (2*cos(θ))
    c.fillStyle = "rgba(255, 255, 255, 0.7)";
    const sqH = 28;
    const cx = size * 0.25;
    const cy = size * 0.42;
    const spacing = sqH * 2; // gap = sqH between squares
    for (let i = -1; i <= 1; i++) {
      const y = cy + i * spacing;
      const lat = Math.PI * (0.5 - y / size);
      const sqW = sqH / (2 * Math.cos(lat));
      c.fillRect(cx - sqW / 2, y - sqH / 2, sqW, sqH);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}
