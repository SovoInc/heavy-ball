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
  Magnet = "magnet",
  Invisible = "invisible",
}

export interface PathSegmentDef {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: number;
  isBridge?: boolean;
  noWalls?: boolean;
  surfaceType?: SurfaceType;
  direction?: [number, number, number]; // for Speed surfaces
  tilt?: number; // pitch angle in radians
  platformMoving?: { axis: [number, number, number]; range: number; speed: number; pause?: number };
  invisible?: { onTime: number; offTime: number };
}

function createArrowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);

  // Draw two chevron arrows pointing up (will be rotated to match direction)
  ctx.strokeStyle = "#6688ff";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const yOff of [20, 72]) {
    ctx.beginPath();
    ctx.moveTo(28, yOff + 28);
    ctx.lineTo(64, yOff);
    ctx.lineTo(100, yOff + 28);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let sharedArrowTexture: THREE.CanvasTexture | null = null;
function getArrowTexture(): THREE.CanvasTexture {
  if (!sharedArrowTexture) sharedArrowTexture = createArrowTexture();
  return sharedArrowTexture;
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
  invisibleActive = true;

  private respawnTimer = -1;
  private physicsMat: CANNON.Material | null = null;
  private invisibleTimer = 0;
  private invisibleOnTime = 2;
  private invisibleOffTime = 2;
  private movingDef: PathSegmentDef["platformMoving"] | null = null;

  private physics: Physics;
  private scene: THREE.Scene;
  private animTime = 0;
  private material: THREE.MeshStandardMaterial;
  private originalPosition: THREE.Vector3;
  extraSceneObjects: THREE.Object3D[] = [];

  private arrowMesh: THREE.Mesh | null = null;
  private arrowMaterial: THREE.MeshBasicMaterial | null = null;
  private fireParticles: THREE.Points | null = null;
  private fireData: { y: number; phase: number; speed: number; baseX: number; baseZ: number }[] = [];
  private frostParticles: THREE.Points | null = null;
  private frostData: { phase: number; baseX: number; baseY: number; baseZ: number }[] = [];
  private magnetParticles: THREE.Points | null = null;
  private magnetData: { angle: number; r: number; speed: number }[] = [];

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
      case SurfaceType.Magnet:
        color = CONFIG.surfaces.magnet.color;
        emissive = CONFIG.surfaces.magnet.emissive;
        emissiveIntensity = 0.8;
        break;
      case SurfaceType.Invisible:
        color = CONFIG.surfaces.invisible.color;
        emissive = CONFIG.surfaces.invisible.emissive;
        emissiveIntensity = 0.3;
        break;
      default:
        color = isBridge ? CONFIG.colors.bridge : CONFIG.colors.path;
        break;
    }

    if (def.surfaceType === SurfaceType.Speed && def.direction) {
      this.speedDirection = new THREE.Vector3(...def.direction).normalize();
    }
    if (def.platformMoving) this.movingDef = def.platformMoving;
    if (def.invisible) {
      this.invisibleOnTime = def.invisible.onTime;
      this.invisibleOffTime = def.invisible.offTime;
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

    // Add animated arrow overlay for speed surfaces
    if (this.surfaceType === SurfaceType.Speed && this.speedDirection) {
      const dir = this.speedDirection;
      const angle = Math.atan2(dir.x, -dir.z);

      // After rotation, the plane's local X/Y map to different world axes.
      // Size the plane so it fits within the platform bounds after rotation.
      const absC = Math.abs(Math.cos(angle));
      const absS = Math.abs(Math.sin(angle));
      // Solve for planeW, planeD such that rotated extents fit in w x d
      const planeW = (absC > 0.01 && absS > 0.01)
        ? Math.min(w / absC, d / absS)
        : (absS < 0.01 ? w : d);
      const planeD = (absC > 0.01 && absS > 0.01)
        ? Math.min(d / absC, w / absS)
        : (absS < 0.01 ? d : w);

      const tex = getArrowTexture().clone();
      tex.repeat.set(planeW / 2, planeD / 2);

      this.arrowMaterial = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const arrowGeo = new THREE.PlaneGeometry(planeW, planeD);
      this.arrowMesh = new THREE.Mesh(arrowGeo, this.arrowMaterial);
      this.arrowMesh.rotation.x = -Math.PI / 2;
      this.arrowMesh.position.set(px, py + h / 2 + 0.05, pz);

      this.arrowMesh.rotation.z = -angle;

      if (def.rotation) {
        this.arrowMesh.rotation.z -= def.rotation;
      }
      scene.add(this.arrowMesh);
      this.extraSceneObjects.push(this.arrowMesh);
    }

    // Add fire particles for lava surfaces
    if (this.surfaceType === SurfaceType.Lava) {
      const count = Math.round(w * d * 4);
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const topY = py + h / 2;

      for (let i = 0; i < count; i++) {
        const bx = px + (Math.random() - 0.5) * w;
        const bz = pz + (Math.random() - 0.5) * d;
        positions[i * 3] = bx;
        positions[i * 3 + 1] = topY + Math.random() * 0.4;
        positions[i * 3 + 2] = bz;

        // Random warm color: orange to yellow
        const t = Math.random();
        colors[i * 3] = 1;                     // R
        colors[i * 3 + 1] = 0.3 + t * 0.5;    // G: 0.3–0.8
        colors[i * 3 + 2] = t * 0.15;          // B: 0–0.15

        this.fireData.push({
          y: topY + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.8,
          baseX: bx,
          baseZ: bz,
        });
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.15,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        sizeAttenuation: true,
      });

      this.fireParticles = new THREE.Points(geo, mat);
      scene.add(this.fireParticles);
      this.extraSceneObjects.push(this.fireParticles);
    }

    // Add frost sparkle particles for ice surfaces
    if (this.surfaceType === SurfaceType.Ice) {
      const count = Math.round(w * d * 2);
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const topY = py + h / 2;

      for (let i = 0; i < count; i++) {
        const bx = px + (Math.random() - 0.5) * w;
        const bz = pz + (Math.random() - 0.5) * d;
        const by = topY + 0.05 + Math.random() * 0.15;
        positions[i * 3] = bx;
        positions[i * 3 + 1] = by;
        positions[i * 3 + 2] = bz;

        // White-blue sparkle colors
        const t = Math.random();
        colors[i * 3] = 0.7 + t * 0.3;       // R: 0.7–1.0
        colors[i * 3 + 1] = 0.85 + t * 0.15;  // G: 0.85–1.0
        colors[i * 3 + 2] = 1;                 // B: always full

        this.frostData.push({
          phase: Math.random() * Math.PI * 2,
          baseX: bx,
          baseY: by,
          baseZ: bz,
        });
      }

      const frostGeo = new THREE.BufferGeometry();
      frostGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      frostGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const frostMat = new THREE.PointsMaterial({
        size: 0.08,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        sizeAttenuation: true,
      });

      this.frostParticles = new THREE.Points(frostGeo, frostMat);
      scene.add(this.frostParticles);
      this.extraSceneObjects.push(this.frostParticles);
    }

    // Swirling black hole particles for magnet surfaces
    if (this.surfaceType === SurfaceType.Magnet) {
      const count = Math.round(w * d * 3);
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const topY = py + h / 2;
      const maxR = Math.min(w, d) / 2;

      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * maxR;
        positions[i * 3] = px + Math.cos(a) * r;
        positions[i * 3 + 1] = topY + 0.1 + Math.random() * 0.3;
        positions[i * 3 + 2] = pz + Math.sin(a) * r;

        const t = Math.random();
        colors[i * 3] = 0.3 + t * 0.3;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0.5 + t * 0.5;

        this.magnetData.push({ angle: a, r, speed: 1.5 + Math.random() * 2 });
      }

      const mGeo = new THREE.BufferGeometry();
      mGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      mGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      this.magnetParticles = new THREE.Points(mGeo, new THREE.PointsMaterial({
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        sizeAttenuation: true,
      }));
      scene.add(this.magnetParticles);
      this.extraSceneObjects.push(this.magnetParticles);
    }

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
    this.physicsMat = physicsMat;

    // Use a thicker collision box to prevent tunneling (cannon-es has no CCD)
    // Thicken collision box downward for ground-level flat platforms to prevent tunneling.
    // Skip thickening for tilted/elevated platforms to avoid misaligned physics.
    const needsExactBody = !!(def.tilt || def.platformMoving);
    const collisionH = (!needsExactBody && py <= 0.1) ? Math.max(h, 2) : h;
    this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(w / 2, collisionH / 2, d / 2)),
      material: physicsMat,
    });
    // Shift body down so the top surface stays at py + h/2
    this.body.position.set(px, py - (collisionH - h) / 2, pz);
    {
      const rotY = def.rotation ?? 0;
      const rotX = def.tilt ?? 0;
      if (rotX || rotY) {
        const q = new CANNON.Quaternion();
        q.setFromEuler(rotX, rotY, 0);
        this.body.quaternion.copy(q);
        if (rotX) this.mesh.rotation.x = rotX;
      }
    }
    if (this.movingDef) {
      this.body.type = CANNON.Body.KINEMATIC;
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

      // Animate fire particles
      if (this.fireParticles) {
        const posArr = this.fireParticles.geometry.attributes.position as THREE.BufferAttribute;
        const colArr = this.fireParticles.geometry.attributes.color as THREE.BufferAttribute;
        const topY = this.mesh.position.y + this.size[1] / 2;

        for (let i = 0; i < this.fireData.length; i++) {
          const fd = this.fireData[i];
          fd.y += fd.speed * dt;
          fd.phase += dt * 4;

          // Wobble horizontally
          const wx = fd.baseX + Math.sin(fd.phase) * 0.1;
          const wz = fd.baseZ + Math.cos(fd.phase * 0.7) * 0.1;

          posArr.setXYZ(i, wx, fd.y, wz);

          // Fade from bright to dim as particle rises
          const life = (fd.y - topY) / 0.6;
          const alpha = Math.max(0, 1 - life);
          colArr.setY(i, (0.3 + life * 0.5) * alpha + 0.1);
          colArr.setZ(i, life * 0.1 * alpha);

          // Reset particle when it rises too high
          if (fd.y > topY + 0.6) {
            fd.y = topY;
            fd.phase = Math.random() * Math.PI * 2;
          }
        }
        posArr.needsUpdate = true;
        colArr.needsUpdate = true;
      }
    }

    if (this.surfaceType === SurfaceType.Ice) {
      // Subtle shimmer on the surface
      const shimmer = 0.2 + Math.sin(this.animTime * 1.5) * 0.1;
      this.material.emissiveIntensity = shimmer;

      // Animate frost sparkles — twinkle in and out
      if (this.frostParticles) {
        const frostMat = this.frostParticles.material as THREE.PointsMaterial;
        const posArr = this.frostParticles.geometry.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < this.frostData.length; i++) {
          const fd = this.frostData[i];
          fd.phase += dt * (1.5 + Math.sin(i) * 0.5);

          // Twinkle: particle bobs slightly and fades in/out
          const twinkle = Math.sin(fd.phase);
          posArr.setY(i, fd.baseY + twinkle * 0.03);
        }
        posArr.needsUpdate = true;

        // Global opacity pulse for shimmer effect
        frostMat.opacity = 0.5 + Math.sin(this.animTime * 2.5) * 0.4;
      }
    }

    if (this.surfaceType === SurfaceType.Bounce) {
      // Breathing glow
      const breath = 0.3 + Math.sin(this.animTime * 2) * 0.2;
      this.material.emissiveIntensity = breath;
    }

    if (this.surfaceType === SurfaceType.Speed && this.arrowMaterial?.map) {
      // Scroll arrows in the conveyor direction
      this.arrowMaterial.map.offset.y -= dt * 1.5;
      this.arrowMaterial.opacity = 0.4 + Math.sin(this.animTime * 3) * 0.2;
    }

    if (this.surfaceType === SurfaceType.Magnet) {
      const pulse = 0.5 + Math.sin(this.animTime * 2) * 0.3;
      this.material.emissiveIntensity = pulse;

      if (this.magnetParticles) {
        const posArr = this.magnetParticles.geometry.attributes.position as THREE.BufferAttribute;
        const topY = this.originalPosition.y + this.size[1] / 2;
        for (let i = 0; i < this.magnetData.length; i++) {
          const md = this.magnetData[i];
          md.angle += md.speed * dt;
          posArr.setXYZ(i,
            this.originalPosition.x + Math.cos(md.angle) * md.r,
            topY + 0.1 + Math.sin(md.angle * 2) * 0.15,
            this.originalPosition.z + Math.sin(md.angle) * md.r,
          );
        }
        posArr.needsUpdate = true;
      }
    }

    if (this.surfaceType === SurfaceType.Invisible) {
      this.invisibleTimer += dt;
      const cycle = this.invisibleOnTime + this.invisibleOffTime;
      const phase = this.invisibleTimer % cycle;
      const shouldBeActive = phase < this.invisibleOnTime;
      if (shouldBeActive !== this.invisibleActive) {
        this.invisibleActive = shouldBeActive;
        if (this.invisibleActive) {
          this.mesh.visible = true;
          this.material.opacity = 1;
          this.material.transparent = false;
          this.physics.addBody(this.body);
          for (const w of this.walls) { w.mesh.visible = true; this.physics.addBody(w.body); }
        } else {
          this.mesh.visible = false;
          this.physics.removeBody(this.body);
          for (const w of this.walls) { w.mesh.visible = false; this.physics.removeBody(w.body); }
        }
      }
      // Flicker warning 1.5s before disappearing
      if (this.invisibleActive && (this.invisibleOnTime - phase) < 1.5) {
        this.material.transparent = true;
        this.material.opacity = 0.3 + Math.sin(this.animTime * 20) * 0.3;
      }
    }

    // Moving platform
    if (this.movingDef) {
      const { axis: [ax, ay, az], range, speed, pause } = this.movingDef;
      let offset: number;
      let vel: number;

      if (pause && pause > 0) {
        // Motion with pause at endpoints:
        // -range → +range (sine sweep) → pause → +range → -range → pause
        const moveTime = Math.PI / speed;
        const fullCycle = 2 * moveTime + 2 * pause;
        const t = this.animTime % fullCycle;

        if (t < moveTime) {
          // Moving from -range to +range
          const phase = -Math.PI / 2 + t * speed;
          offset = Math.sin(phase) * range;
          vel = Math.cos(phase) * range * speed;
        } else if (t < moveTime + pause) {
          // Paused at +range
          offset = range;
          vel = 0;
        } else if (t < 2 * moveTime + pause) {
          // Moving from +range to -range
          const phase = Math.PI / 2 - (t - moveTime - pause) * speed;
          offset = Math.sin(phase) * range;
          vel = -Math.cos(phase) * range * speed;
        } else {
          // Paused at -range
          offset = -range;
          vel = 0;
        }
      } else {
        // Simple sine motion, no pause
        offset = Math.sin(this.animTime * speed) * range;
        vel = Math.cos(this.animTime * speed) * range * speed;
      }

      this.mesh.position.set(
        this.originalPosition.x + ax * offset,
        this.originalPosition.y + ay * offset,
        this.originalPosition.z + az * offset,
      );
      this.body.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
      this.body.velocity.set(ax * vel, ay * vel, az * vel);
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
        for (const w of this.walls) {
          w.mesh.visible = false;
          this.physics.removeBody(w.body);
        }
        this.respawnTimer = CONFIG.surfaces.crumbling.respawn;
      }
    }

    // Auto-respawn after crumble
    if (this.crumbled && this.respawnTimer >= 0) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.restore();
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
    this.respawnTimer = -1;
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
