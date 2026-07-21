import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";
import { BALL_PROFILES, DEFAULT_BALL_ID, type BallId, type BallProfile } from "../balls";
import { elementalEmissive } from "../ballVisuals";

export class Ball {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  private physics: Physics;
  private currentScale = 1;
  private visualQuat = new THREE.Quaternion();
  private impactPulse = 0;
  private abducting = false;
  private abductionTime = 0;
  private abductionOrigin = new CANNON.Vec3();
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private accents: THREE.Object3D[] = [];
  private visualTime = 0;
  profile: BallProfile = BALL_PROFILES[DEFAULT_BALL_ID];

  constructor(scene: THREE.Scene, physics: Physics) {
    this.physics = physics;
    const { radius } = CONFIG.ball;
    const { mass, linearDamping, angularDamping } = this.profile;

    const geo = new THREE.SphereGeometry(radius, 64, 64);
    const texture = Ball.createProfileTexture(this.profile);
    // Clearcoat lacquer over the metallic base — with the scene environment
    // map this reads as a polished billiard ball instead of flat gray.
    const mat = new THREE.MeshPhysicalMaterial({
      color: this.profile.color,
      metalness: 0.62,
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      map: texture,
      emissive: this.profile.emissive,
      emissiveIntensity: 0.42,
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
    this.buildAccents(this.profile.id);
  }

  setProfile(id: BallId) {
    this.profile = BALL_PROFILES[id];
    this.body.mass = this.profile.mass;
    this.body.linearDamping = this.profile.linearDamping;
    this.body.angularDamping = this.profile.angularDamping;
    this.body.updateMassProperties();
    this.physics.setBallHandling(this.profile.gripMultiplier, this.profile.restitutionMultiplier);
    const mat = this.mesh.material as THREE.MeshPhysicalMaterial;
    this.mesh.geometry.dispose();
    this.mesh.geometry = id === "heavy"
      ? new THREE.DodecahedronGeometry(CONFIG.ball.radius, 2)
      : id === "light"
        ? new THREE.IcosahedronGeometry(CONFIG.ball.radius, 3)
        : new THREE.SphereGeometry(CONFIG.ball.radius, id === "magma" ? 48 : 64, id === "magma" ? 32 : 64);
    mat.color.setHex(this.profile.color);
    mat.emissive.setHex(this.profile.emissive);
    mat.emissiveIntensity = id === "magma" ? 0.78 : id === "heavy" ? 0.62 : 0.42;
    mat.metalness = id === "light" ? 0.2 : 0.62;
    mat.roughness = id === "magma" ? 0.58 : id === "light" ? 0.12 : 0.25;
    mat.map?.dispose();
    mat.map = Ball.createProfileTexture(this.profile);
    mat.needsUpdate = true;
    this.buildAccents(id);
  }

  setElementalTint(fire: number, ice: number) {
    const mat = this.mesh.material as THREE.MeshPhysicalMaterial;
    elementalEmissive(this.profile, fire, ice, mat.emissive);
  }

  private buildAccents(id: BallId) {
    for (const accent of this.accents) {
      this.mesh.remove(accent);
      if (accent instanceof THREE.Mesh) {
        accent.geometry.dispose();
        const material = accent.material as THREE.Material;
        material.dispose();
      }
    }
    this.accents = [];

    const glowMaterial = (color: number, opacity = 0.9) => new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const add = (object: THREE.Object3D) => { this.mesh.add(object); this.accents.push(object); };

    if (id === "core") {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.014, 8, 72), glowMaterial(0x62d9ff, 0.72));
      ring.rotation.x = Math.PI / 2;
      add(ring);
    } else if (id === "heavy") {
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.515, 0.025, 8, 72), glowMaterial(0xff5a24, 0.86));
        ring.rotation.set(i === 0 ? Math.PI / 2 : Math.PI / 5, i === 1 ? Math.PI / 2 : i * Math.PI / 3, i * Math.PI / 3);
        add(ring);
      }
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 1), glowMaterial(0xffc06a, 0.92));
      add(core);
    } else if (id === "light") {
      const crystal = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.515, 2),
        new THREE.MeshBasicMaterial({ color: 0xc8fbff, wireframe: true, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending }),
      );
      add(crystal);
      for (let i = 0; i < 3; i++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), glowMaterial(0xeaffff, 0.8));
        shard.position.set(Math.cos(i * 2.1) * 0.39, (i - 1) * 0.19, Math.sin(i * 2.1) * 0.39);
        shard.scale.set(0.45, 1.7, 0.45);
        add(shard);
      }
    } else {
      const crust = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.508, 2),
        new THREE.MeshBasicMaterial({ color: 0xff4b17, wireframe: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }),
      );
      add(crust);
      const furnace = new THREE.Mesh(new THREE.IcosahedronGeometry(0.39, 2), glowMaterial(0xff2500, 0.34));
      add(furnace);
    }
  }

  setPosition(x: number, y: number, z: number) {
    this.abducting = false;
    this.body.position.set(x, y, z);
    this.body.velocity.setZero();
    this.body.angularVelocity.setZero();
    this.body.quaternion.setFromEuler(0, 0, 0);
    this.visualQuat.identity();
    this.syncMesh();
  }

  syncMesh(dt = 1 / 60) {
    this.visualTime += dt;
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
    this.impactPulse = Math.max(0, this.impactPulse - dt * 5.5);
    const squash = Math.sin(this.impactPulse * Math.PI) * 0.13;
    this.mesh.scale.set(
      this.currentScale * (1 + squash),
      this.currentScale * (1 - squash * 0.8),
      this.currentScale * (1 + squash),
    );
    if (this.profile.id === "heavy") {
      this.accents.forEach((accent, i) => { accent.rotation.z += dt * (i % 2 ? -0.8 : 0.6); });
    } else if (this.profile.id === "light") {
      this.accents.forEach((accent, i) => { accent.rotation.y += dt * (0.25 + i * 0.08); });
    } else if (this.profile.id === "magma") {
      this.accents.forEach((accent, i) => {
        const mat = (accent as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = (i === 0 ? 0.42 : 0.25) + Math.sin(this.visualTime * 4.5 + i) * 0.13;
      });
    }
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

  pulseImpact(strength = 1) {
    this.impactPulse = Math.max(this.impactPulse, THREE.MathUtils.clamp(strength, 0.45, 1));
  }

  beginAbduction() {
    this.abducting = true;
    this.abductionTime = 0;
    this.abductionOrigin.copy(this.body.position);
    this.body.velocity.setZero();
    this.body.angularVelocity.setZero();
  }

  updateAbduction(dt: number): number {
    if (!this.abducting) return 0;
    this.abductionTime += dt;
    const duration = this.reducedMotion ? 0.55 : 1.45;
    const t = THREE.MathUtils.clamp(this.abductionTime / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const lift = eased * (this.reducedMotion ? 1.1 : 3.4);
    const wobble = this.reducedMotion ? 0 : Math.sin(t * Math.PI * 7) * 0.07 * (1 - t);

    this.body.position.set(
      this.abductionOrigin.x + Math.sin(t * Math.PI * 5) * wobble,
      this.abductionOrigin.y + lift,
      this.abductionOrigin.z + Math.cos(t * Math.PI * 4) * wobble,
    );
    this.visualQuat.premultiply(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dt * (2.2 + t * 5)),
    );
    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(this.visualQuat);
    const scale = this.currentScale * THREE.MathUtils.lerp(1, 0.88, eased);
    this.mesh.scale.setScalar(scale);
    return t;
  }

  /**
   * Draw the midnight logo procedurally onto a canvas texture.
   * Uses equirectangular projection math so circles appear round on the sphere.
   */
  private static createProfileTexture(profile: BallProfile): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const c = canvas.getContext("2d")!;

    const isMagma = profile.id === "magma";
    const isLight = profile.id === "light";
    const isHeavy = profile.id === "heavy";
    c.fillStyle = isMagma ? "#170806" : isLight ? "#b9edf2" : isHeavy ? "#171c24" : "#111822";
    c.fillRect(0, 0, size, size);

    if (isMagma) {
      c.strokeStyle = "#ff5a18";
      c.shadowColor = "#ff2700";
      c.shadowBlur = 14;
      c.lineWidth = 7;
      for (let i = 0; i < 22; i++) {
        let x = (i * 83) % size;
        let y = (i * 137) % size;
        c.beginPath(); c.moveTo(x, y);
        for (let j = 0; j < 4; j++) { x += 22 - ((i + j) % 3) * 15; y += 24; c.lineTo(x, y); }
        c.stroke();
      }
      c.shadowBlur = 0;
    }

    // Subtle panel lines so the ball reads as a polished game object.
    c.strokeStyle = isHeavy ? "rgba(255, 106, 61, 0.34)" : isLight ? "rgba(255,255,255,.52)" : "rgba(120, 200, 255, 0.22)";
    c.lineWidth = 2;
    for (let x = 0; x <= size; x += 64) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, size);
      c.stroke();
    }
    for (let y = 64; y < size; y += 96) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(size, y);
      c.stroke();
    }

    // Three white squares in a vertical line.
    // Sphere UV: width = 2π, height = π. At latitude θ, one horizontal pixel
    // covers (2π/size)*cos(θ) surface distance, one vertical pixel covers π/size.
    // To get equal angular size: sqW = sqH * (π/size) / ((2π/size)*cos(θ)) = sqH / (2*cos(θ))
    c.fillStyle = isMagma ? "rgba(255,190,80,.94)" : isHeavy ? "rgba(255,106,61,.9)" : "rgba(255, 255, 255, 0.82)";
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
