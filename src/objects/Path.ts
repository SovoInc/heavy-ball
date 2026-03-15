import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";

export enum SurfaceType {
  Normal = "normal",
  Ice = "ice",
  Lava = "lava",
  Bounce = "bounce",
  Speed = "speed",
  Crumbling = "crumbling",
}

export interface PathSegmentDef {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: number;
  isBridge?: boolean;
  noWalls?: boolean;
  surfaceType?: SurfaceType;
  direction?: [number, number, number]; // for Speed surfaces
}

export class PathSegment {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  walls: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
  surfaceType: SurfaceType;
  size: [number, number, number];
  speedDirection: THREE.Vector3 | null = null;
  crumbleTimer = -1;
  crumbled = false;

  private physics: Physics;
  private scene: THREE.Scene;
  private animTime = 0;
  private material: THREE.MeshStandardMaterial;
  private originalPosition: THREE.Vector3;

  constructor(
    scene: THREE.Scene,
    physics: Physics,
    def: PathSegmentDef,
  ) {
    this.scene = scene;
    this.physics = physics;
    const [w, h, d] = def.size;
    const [px, py, pz] = def.position;
    const isBridge = def.isBridge ?? false;
    this.surfaceType = def.surfaceType ?? SurfaceType.Normal;
    this.size = [w, h, d];

    // Determine color and material properties based on surface type
    let color: number;
    let emissive = 0x000000;
    let emissiveIntensity = 0;
    let opacity = 1;
    let transparent = false;

    switch (this.surfaceType) {
      case SurfaceType.Ice:
        color = CONFIG.surfaces.ice.color;
        emissive = CONFIG.surfaces.ice.emissive;
        emissiveIntensity = 0.3;
        opacity = CONFIG.surfaces.ice.opacity;
        transparent = true;
        break;
      case SurfaceType.Lava:
        color = CONFIG.surfaces.lava.color;
        emissive = CONFIG.surfaces.lava.emissive;
        emissiveIntensity = 0.6;
        break;
      case SurfaceType.Bounce:
        color = CONFIG.surfaces.bounce.color;
        emissive = CONFIG.surfaces.bounce.emissive;
        emissiveIntensity = 0.4;
        break;
      case SurfaceType.Speed:
        color = CONFIG.surfaces.speed.color;
        emissive = CONFIG.surfaces.speed.emissive;
        emissiveIntensity = 0.5;
        break;
      case SurfaceType.Crumbling:
        color = CONFIG.surfaces.crumbling.color;
        emissive = CONFIG.surfaces.crumbling.emissive;
        emissiveIntensity = 0;
        break;
      default:
        color = isBridge ? CONFIG.colors.bridge : CONFIG.colors.path;
        break;
    }

    if (def.surfaceType === SurfaceType.Speed && def.direction) {
      this.speedDirection = new THREE.Vector3(...def.direction).normalize();
    }

    const geo = new THREE.BoxGeometry(w, h, d);
    this.material = new THREE.MeshStandardMaterial({
      color,
      roughness: this.surfaceType === SurfaceType.Ice ? 0.1 : 0.8,
      metalness: this.surfaceType === SurfaceType.Ice ? 0.6 : 0.1,
      emissive,
      emissiveIntensity,
      transparent,
      opacity,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(px, py, pz);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    if (def.rotation) {
      this.mesh.rotation.y = def.rotation;
    }
    this.originalPosition = this.mesh.position.clone();
    scene.add(this.mesh);

    // Determine physics material
    let physicsMat: CANNON.Material;
    switch (this.surfaceType) {
      case SurfaceType.Ice:
        physicsMat = physics.iceMaterial;
        break;
      case SurfaceType.Bounce:
        physicsMat = physics.bounceMaterial;
        break;
      default:
        physicsMat = physics.groundMaterial;
        break;
    }

    // Use a thicker collision box to prevent tunneling (cannon-es has no CCD)
    // Only thicken downward for ground-level platforms; elevated ones use actual height
    // to avoid creating invisible walls that deflect the ball sideways
    const collisionH = py > 0.1 ? h : Math.max(h, 2);
    this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(w / 2, collisionH / 2, d / 2)),
      material: physicsMat,
    });
    // Shift body down so the top surface stays at py + h/2
    this.body.position.set(px, py - (collisionH - h) / 2, pz);
    if (def.rotation) {
      this.body.quaternion.setFromEuler(0, def.rotation, 0);
    }
    physics.addBody(this.body);

    if (!def.noWalls && !isBridge) {
      this.addEdgeWalls(scene, physics, w, h, d, px, py, pz, def.rotation ?? 0);
    }

    if (isBridge) {
      this.addBridgeRails(scene, physics, w, h, d, px, py, pz, def.rotation ?? 0);
    }
  }

  update(dt: number) {
    this.animTime += dt;

    if (this.surfaceType === SurfaceType.Lava) {
      // Pulsing glow
      const pulse = 0.4 + Math.sin(this.animTime * 3) * 0.3;
      this.material.emissiveIntensity = pulse;
    }

    if (this.surfaceType === SurfaceType.Bounce) {
      // Breathing glow
      const breath = 0.3 + Math.sin(this.animTime * 2) * 0.2;
      this.material.emissiveIntensity = breath;
    }

    if (this.surfaceType === SurfaceType.Crumbling && this.crumbleTimer >= 0 && !this.crumbled) {
      this.crumbleTimer -= dt;

      // Fade out as crumble progresses
      const remaining = this.crumbleTimer / CONFIG.surfaces.crumbling.delay;
      this.material.opacity = Math.max(0, remaining);
      this.material.transparent = true;

      // Shake effect
      const shake = (1 - remaining) * 0.05;
      this.mesh.position.x += (Math.random() - 0.5) * shake;
      this.mesh.position.z += (Math.random() - 0.5) * shake;

      if (this.crumbleTimer <= 0) {
        this.crumbled = true;
        this.mesh.visible = false;
        this.physics.removeBody(this.body);
        // Remove wall bodies too
        for (const w of this.walls) {
          w.mesh.visible = false;
          this.physics.removeBody(w.body);
        }
      }
    }
  }

  startCrumble() {
    if (this.surfaceType === SurfaceType.Crumbling && this.crumbleTimer < 0) {
      this.crumbleTimer = CONFIG.surfaces.crumbling.delay;
    }
  }

  restore() {
    if (!this.crumbled && this.crumbleTimer < 0) return;

    this.crumbled = false;
    this.crumbleTimer = -1;
    this.mesh.visible = true;
    this.material.opacity = 1;
    this.material.transparent = false;
    this.mesh.position.copy(this.originalPosition);

    this.physics.addBody(this.body);
    for (const w of this.walls) {
      w.mesh.visible = true;
      this.physics.addBody(w.body);
    }
  }

  private addEdgeWalls(
    scene: THREE.Scene,
    physics: Physics,
    w: number, h: number, d: number,
    px: number, py: number, pz: number,
    rotation: number,
  ) {
    const wallH = CONFIG.path.wallHeight;
    const wallT = CONFIG.path.wallThickness;
    const collisionT = 1.5; // thick collision to prevent penetration

    const oy = py + h / 2 + wallH / 2;
    const sides: [number, number][] = [
      [1, w / 2],   // right wall
      [-1, w / 2],  // left wall
    ];

    for (const [sign, halfW] of sides) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      // Visual: thin, at path edge
      const visualOx = sign * (halfW + wallT / 2);
      const vrx = visualOx * cos + px;
      const vrz = visualOx * sin + pz;

      const geo = new THREE.BoxGeometry(wallT, wallH, d);
      const mat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.pathEdge,
        roughness: 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: 0.35,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(vrx, oy, vrz);
      if (rotation) mesh.rotation.y = rotation;
      mesh.castShadow = true;
      scene.add(mesh);

      // Collision: thick, inner face aligned with path edge
      const collisionOx = sign * (halfW + collisionT / 2);
      const crx = collisionOx * cos + px;
      const crz = collisionOx * sin + pz;

      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(collisionT / 2, wallH / 2, d / 2)),
        material: physics.wallMaterial,
      });
      body.position.set(crx, oy, crz);
      if (rotation) body.quaternion.setFromEuler(0, rotation, 0);
      physics.addBody(body);

      this.walls.push({ mesh, body });
    }
  }

  private addBridgeRails(
    scene: THREE.Scene,
    _physics: Physics,
    w: number, h: number, d: number,
    px: number, py: number, pz: number,
    rotation: number,
  ) {
    const railH = CONFIG.path.bridgeRailHeight;
    const railT = 0.08;

    const offsets: [number, number][] = [
      [w / 2, 0],
      [-w / 2, 0],
    ];

    for (const [ox, oz] of offsets) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rx = ox * cos - oz * sin + px;
      const rz = ox * sin + oz * cos + pz;
      const ry = py + h / 2 + railH / 2;

      const geo = new THREE.BoxGeometry(railT, railH, d);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xccaa77,
        roughness: 0.6,
        metalness: 0.3,
        emissive: 0x332200,
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(rx, ry, rz);
      if (rotation) mesh.rotation.y = rotation;
      scene.add(mesh);
    }
  }
}
