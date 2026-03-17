import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";

export class Ball {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  private physics: Physics;
  private currentScale = 1;
  private visualQuat = new THREE.Quaternion();

  constructor(scene: THREE.Scene, physics: Physics) {
    this.physics = physics;
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
    this.visualQuat.identity();
    this.syncMesh();
  }

  syncMesh(dt = 1 / 60) {
    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);

    // Derive visual rotation from linear velocity (decoupled from physics spin)
    const vel = this.body.velocity;
    const groundSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    if (groundSpeed > 0.1) {
      const r = CONFIG.ball.radius * this.currentScale;
      const angle = (groundSpeed / r) * dt;
      // Rolling axis is perpendicular to velocity in the ground plane
      const axis = new THREE.Vector3(vel.z / groundSpeed, 0, -vel.x / groundSpeed);
      const delta = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      this.visualQuat.premultiply(delta);
    }
    this.mesh.quaternion.copy(this.visualQuat);
  }

  get position(): CANNON.Vec3 {
    return this.body.position;
  }

  get speed(): number {
    return this.body.velocity.length();
  }

  setScale(factor: number) {
    if (factor === this.currentScale) return;
    this.currentScale = factor;
    const r = CONFIG.ball.radius * factor;
    this.mesh.scale.setScalar(factor);
    // Replace physics shape
    while (this.body.shapes.length) this.body.removeShape(this.body.shapes[0]);
    this.body.addShape(new CANNON.Sphere(r));
  }

  resetScale() {
    this.setScale(1);
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
    const sqH = 56;
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
    tex.anisotropy = 16;
    return tex;
  }
}
