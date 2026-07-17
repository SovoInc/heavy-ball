import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { Physics } from "../physics";
import { FlameField } from "../effects/FlameField";
import {
  createCrackTexture,
  createFireMaterial,
  COURSE_RAIL,
  createEnergyMaterial,
  createRoundedBar,
  createRoundedBoxGeometry,
  createRoundedPanel,
  createSciFiMaterial,
  getFireSpriteTexture,
  getIceSurfaceTexture,
  getLavaFlowTexture,
  getSnowflakeSpriteTexture,
} from "./visuals";

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

// Platforms render translucent so the world reads through them.
// Normal platforms are more see-through; special surfaces keep more body
// so their gameplay color stays readable.
export const PLATFORM_OPACITY = 0.9;
export const NORMAL_PLATFORM_OPACITY = 0.96;

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
  /** Authored direction of travel, used to keep edge rails parallel to motion. */
  travelAxis?: "x" | "z";
}

function createArrowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);

  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "rgba(120, 180, 255, 0)");
  gradient.addColorStop(0.45, "rgba(125, 205, 255, 0.9)");
  gradient.addColorStop(1, "rgba(90, 130, 255, 0)");

  // Draw stacked sci-fi chevrons pointing up (rotated per speed direction).
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const yOff of [16, 60, 104]) {
    ctx.beginPath();
    ctx.moveTo(24, yOff + 26);
    ctx.lineTo(64, yOff);
    ctx.lineTo(104, yOff + 26);
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

let sharedCrackTexture: THREE.CanvasTexture | null = null;
function getCrackTexture(): THREE.CanvasTexture {
  if (!sharedCrackTexture) sharedCrackTexture = createCrackTexture();
  return sharedCrackTexture;
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
  private static epsilonCounter = 0;
  private material: THREE.MeshStandardMaterial;
  private surfaceTexture: THREE.Texture | null = null;
  private travelAxis: "x" | "z";
  private baseOpacity = PLATFORM_OPACITY;
  private originalPosition: THREE.Vector3;
  extraSceneObjects: THREE.Object3D[] = [];

  private arrowMesh: THREE.Mesh | null = null;
  private arrowMaterial: THREE.MeshBasicMaterial | null = null;
  private fireParticles: THREE.Points | null = null;
  private flameField: FlameField | null = null;
  private fireData: { y: number; phase: number; speed: number; wobble: number; baseX: number; baseZ: number; lifeMax: number; size: number }[] = [];
  private fireTopY = 0;
  private fireRise = 0.9;
  private frostParticles: THREE.Points | null = null;
  private frostData: { y: number; speed: number; baseX: number; baseZ: number; swayPhase: number; swaySpeed: number; swayAmp: number; size: number }[] = [];
  private snowTopY = 0;
  private snowBottomY = 0;
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
    this.travelAxis = def.travelAxis ?? (d >= w ? "z" : "x");
    this.size = [w, h, d];

    // Determine color and material properties based on surface type
    let color: number;
    let emissive = 0x000000;
    let emissiveIntensity = 0;
    this.baseOpacity =
      this.surfaceType === SurfaceType.Normal ? NORMAL_PLATFORM_OPACITY : PLATFORM_OPACITY;
    const opacity = this.baseOpacity;
    const transparent = this.surfaceType !== SurfaceType.Normal;

    switch (this.surfaceType) {
      case SurfaceType.Ice:
        color = CONFIG.surfaces.ice.color;
        emissive = CONFIG.surfaces.ice.emissive;
        emissiveIntensity = 0.5;
        break;
      case SurfaceType.Lava:
        color = CONFIG.surfaces.lava.color;
        emissive = CONFIG.surfaces.lava.emissive;
        emissiveIntensity = 1.6;
        break;
      case SurfaceType.Bounce:
        color = CONFIG.surfaces.bounce.color;
        emissive = CONFIG.surfaces.bounce.emissive;
        emissiveIntensity = 1.1;
        break;
      case SurfaceType.Speed:
        color = CONFIG.surfaces.speed.color;
        emissive = CONFIG.surfaces.speed.emissive;
        emissiveIntensity = 1.2;
        break;
      case SurfaceType.Crumbling:
        color = CONFIG.surfaces.crumbling.color;
        emissive = CONFIG.surfaces.crumbling.emissive;
        emissiveIntensity = 0;
        break;
      case SurfaceType.Magnet:
        color = CONFIG.surfaces.magnet.color;
        emissive = CONFIG.surfaces.magnet.emissive;
        emissiveIntensity = 1.8;
        break;
      case SurfaceType.Invisible:
        color = CONFIG.surfaces.invisible.color;
        emissive = CONFIG.surfaces.invisible.emissive;
        emissiveIntensity = 0.6;
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

    const mergesWithCourse = !this.movingDef && !isBridge;
    const platformRadius = Math.min(0.28, w * 0.08, d * 0.08, h * 0.45);
    // Static normal pieces are sections of one continuous course, not a row
    // of rounded floating blocks. Square ends meet flush; gameplay pieces keep
    // their rounded silhouette so their independence remains readable.
    const geo = mergesWithCourse
      ? new THREE.BoxGeometry(w, h, d)
      : createRoundedBoxGeometry(w, h, d, platformRadius, 5);
    this.material = createSciFiMaterial({
      color,
      roughness: this.surfaceType === SurfaceType.Ice ? 0.16 : this.surfaceType === SurfaceType.Lava ? 0.42 : 0.58,
      metalness: this.surfaceType === SurfaceType.Ice ? 0.55 : this.surfaceType === SurfaceType.Lava ? 0.08 : 0.28,
      emissive,
      emissiveIntensity,
      transparent,
      opacity,
      map: this.getSurfaceTexture(),
      depthWrite: this.surfaceType === SurfaceType.Normal,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    // Smooth blended translucency without seams: an invisible depth pre-pass
    // copy writes depth in the opaque pass, so the translucent platform blends
    // exactly once per pixel — interior box faces and crossing segments can't
    // show through as bands.
    if (transparent) {
      const depthPrepass = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ colorWrite: false }));
      this.mesh.add(depthPrepass);
    }
    // Translucent gameplay pieces need a tiny stagger at overlaps. Opaque
    // normal course pieces stay on the exact authored plane so joins disappear.
    const yEpsilon = this.movingDef
      ? ((PathSegment.epsilonCounter++ % 16) + 1) * 0.0004
      : 0;
    this.mesh.position.set(px, py + yEpsilon, pz);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    if (def.rotation) {
      this.mesh.rotation.y = def.rotation;
    }
    this.originalPosition = this.mesh.position.clone();
    this.addPlatformAccents(w, h, d, color, emissive, isBridge);
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
      const count = Math.max(18, Math.round(w * d * 2.0));
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const topY = py + h / 2;
      this.fireTopY = topY;

      for (let i = 0; i < count; i++) {
        const bx = px + (Math.random() - 0.5) * w;
        const bz = pz + (Math.random() - 0.5) * d;
        const startY = topY + Math.pow(Math.random(), 1.8) * this.fireRise;
        positions[i * 3] = bx;
        positions[i * 3 + 1] = startY;
        positions[i * 3 + 2] = bz;

        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.7;

        const size = 0.5 + Math.random() * 0.3;
        sizes[i] = size;
        this.fireData.push({
          y: startY,
          phase: Math.random() * Math.PI * 2,
          speed: 0.9 + Math.random() * 1.2,
          wobble: 0.08 + Math.random() * 0.18,
          baseX: bx,
          baseZ: bz,
          lifeMax: this.fireRise,
          size,
        });
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("flameSize", new THREE.BufferAttribute(sizes, 1));

      const mat = createFireMaterial();

      this.fireParticles = new THREE.Points(geo, mat);
      scene.add(this.fireParticles);
      this.extraSceneObjects.push(this.fireParticles);

      const tongueCount = Math.max(14, Math.round(w * d * 1.35));
      const tonguePositions = Array.from({ length: tongueCount }, () => ({
        x: px + (Math.random() - 0.5) * w * 0.94,
        z: pz + (Math.random() - 0.5) * d * 0.94,
      }));
      this.flameField = new FlameField(tonguePositions, topY + 0.01);
      scene.add(this.flameField.mesh);
      this.extraSceneObjects.push(this.flameField.mesh);
    }

    // Add falling snow particles for ice surfaces
    if (this.surfaceType === SurfaceType.Ice) {
      const count = Math.max(16, Math.round(w * d * 1.2));
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const topY = py + h / 2;
      const fallTop = topY + 4.5;
      const fallBottom = topY + 0.05;
      this.snowTopY = fallTop;
      this.snowBottomY = fallBottom;

      for (let i = 0; i < count; i++) {
        const bx = px + (Math.random() - 0.5) * w;
        const bz = pz + (Math.random() - 0.5) * d;
        const by = fallBottom + Math.random() * (fallTop - fallBottom);
        positions[i * 3] = bx;
        positions[i * 3 + 1] = by;
        positions[i * 3 + 2] = bz;

        const tint = 0.92 + Math.random() * 0.08;
        colors[i * 3] = tint;
        colors[i * 3 + 1] = tint;
        colors[i * 3 + 2] = 1;

        this.frostData.push({
          y: by,
          speed: 0.45 + Math.random() * 0.5,
          baseX: bx,
          baseZ: bz,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.7 + Math.random() * 0.9,
          swayAmp: 0.12 + Math.random() * 0.25,
          size: 0.6 + Math.random() * 0.7,
        });
      }

      const frostGeo = new THREE.BufferGeometry();
      frostGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      frostGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const frostMat = new THREE.PointsMaterial({
        size: 0.11,
        map: getSnowflakeSpriteTexture(),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexColors: true,
        sizeAttenuation: true,
        alphaTest: 0.02,
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
      const pulse = 1.2 + Math.sin(this.animTime * 3) * 0.7;
      this.material.emissiveIntensity = pulse;
      if (this.surfaceTexture) this.surfaceTexture.offset.y -= dt * 0.08;
      this.flameField?.update(dt);

      // Animate fire particles
      if (this.fireParticles) {
        const posArr = this.fireParticles.geometry.attributes.position as THREE.BufferAttribute;
        const colArr = this.fireParticles.geometry.attributes.color as THREE.BufferAttribute;
        const sizeArr = this.fireParticles.geometry.attributes.flameSize as THREE.BufferAttribute;
        const topY = this.fireTopY;
        const rise = this.fireRise;

        for (let i = 0; i < this.fireData.length; i++) {
          const fd = this.fireData[i];
          fd.y += fd.speed * dt;
          fd.phase += dt * (3 + fd.speed);

          const life = Math.max(0, Math.min(1, (fd.y - topY) / rise));
          // Wobble more as particle rises
          const wobbleScale = fd.wobble * (0.4 + life * 1.2);
          const wx = fd.baseX + Math.sin(fd.phase) * wobbleScale;
          const wz = fd.baseZ + Math.cos(fd.phase * 0.7) * wobbleScale;

          posArr.setXYZ(i, wx, fd.y, wz);

          // Color: white-yellow at base → orange → red → dark
          let r: number, g: number, b: number;
          if (life < 0.25) {
            const t = life / 0.25;
            r = 1; g = 1 - t * 0.1; b = 0.75 - t * 0.55;
          } else if (life < 0.6) {
            const t = (life - 0.25) / 0.35;
            r = 1; g = 0.9 - t * 0.55; b = 0.2 - t * 0.18;
          } else {
            const t = (life - 0.6) / 0.4;
            r = 1 - t * 0.5; g = 0.35 - t * 0.3; b = 0.02;
          }
          colArr.setXYZ(i, r, g, b);
          sizeArr.setX(i, fd.size * (1 - life * 0.62));

          // Reset particle when it rises too high
          if (fd.y > topY + rise) {
            fd.y = topY + Math.random() * 0.05;
            fd.phase = Math.random() * Math.PI * 2;
            fd.speed = 0.9 + Math.random() * 1.2;
          }
        }
        posArr.needsUpdate = true;
        colArr.needsUpdate = true;
        sizeArr.needsUpdate = true;
      }
    }

    if (this.surfaceType === SurfaceType.Ice) {
      // Subtle shimmer on the surface
      const shimmer = 0.35 + Math.sin(this.animTime * 1.5) * 0.15;
      this.material.emissiveIntensity = shimmer;

      // Animate falling snow
      if (this.frostParticles) {
        const posArr = this.frostParticles.geometry.attributes.position as THREE.BufferAttribute;
        const top = this.snowTopY;
        const bottom = this.snowBottomY;
        const range = top - bottom;

        for (let i = 0; i < this.frostData.length; i++) {
          const fd = this.frostData[i];
          fd.y -= fd.speed * dt;
          fd.swayPhase += fd.swaySpeed * dt;

          const sway = Math.sin(fd.swayPhase) * fd.swayAmp;
          const swayZ = Math.cos(fd.swayPhase * 0.6) * fd.swayAmp * 0.6;
          posArr.setXYZ(i, fd.baseX + sway, fd.y, fd.baseZ + swayZ);

          if (fd.y < bottom) {
            fd.y = top + Math.random() * range * 0.3;
            fd.swayPhase = Math.random() * Math.PI * 2;
          }
        }
        posArr.needsUpdate = true;
      }
    }

    if (this.surfaceType === SurfaceType.Bounce) {
      // Breathing glow
      const breath = 0.8 + Math.sin(this.animTime * 2) * 0.4;
      this.material.emissiveIntensity = breath;
    }

    if (this.surfaceType === SurfaceType.Speed && this.arrowMaterial?.map) {
      // Scroll arrows in the conveyor direction
      this.arrowMaterial.map.offset.y -= dt * 1.5;
      this.arrowMaterial.opacity = 0.4 + Math.sin(this.animTime * 3) * 0.2;
    }

    if (this.surfaceType === SurfaceType.Magnet) {
      const pulse = 1.3 + Math.sin(this.animTime * 2) * 0.6;
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
          this.material.opacity = this.baseOpacity;
          this.material.transparent = true;
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
        this.material.opacity = this.baseOpacity * (0.55 + Math.sin(this.animTime * 20) * 0.55);
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
      this.material.opacity = Math.max(0, remaining) * this.baseOpacity;
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
    this.material.opacity = this.baseOpacity;
    this.material.transparent = true;
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

      const geo = createRoundedBoxGeometry(wallT, wallH, d, Math.min(0.12, wallT * 0.45), 4);
      const mat = createEnergyMaterial(CONFIG.colors.pathEdge, 0.36, 1.1);
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
    _scene: THREE.Scene,
    _physics: Physics,
    w: number, h: number, d: number,
    _px: number, _py: number, _pz: number,
    _rotation: number,
  ) {
    const railH = CONFIG.path.bridgeRailHeight;
    const railT = 0.08;
    const railMat = createSciFiMaterial({
      color: 0xd5b681,
      emissive: 0x5c3a11,
      emissiveIntensity: 0.45,
      roughness: 0.45,
      metalness: 0.45,
    });

    const offsets: [number, number][] = [
      [w / 2, 0],
      [-w / 2, 0],
    ];

    for (const [ox, oz] of offsets) {
      const mesh = createRoundedBar(railT, railH, d, railMat, 0.04);
      mesh.position.set(ox, h / 2 + railH / 2, oz);
      this.mesh.add(mesh);
    }
  }

  private addPlatformAccents(
    w: number,
    h: number,
    d: number,
    color: number,
    emissive: number,
    isBridge: boolean,
  ) {
    if ([SurfaceType.Normal, SurfaceType.Lava, SurfaceType.Ice].includes(this.surfaceType)) {
      const edgeColor = this.surfaceType === SurfaceType.Lava
        ? 0xff4b18
        : this.surfaceType === SurfaceType.Ice
          ? 0x9eefff
          : CONFIG.colors.pathEdge;
      const edgeMaterial = createEnergyMaterial(
        edgeColor,
        COURSE_RAIL.opacity,
        COURSE_RAIL.emissiveIntensity,
      );
      const railInset = Math.min(COURSE_RAIL.inset, Math.min(w, d) * 0.1);
      const railHeight = 0.055;
      const railWidth = COURSE_RAIL.width;

      // Rails follow the long axis, giving the course a continuous racing line
      // without covering the surface in a decorative grid.
      if (this.travelAxis === "z") {
        for (const sign of [-1, 1]) {
          const rail = createRoundedBar(railWidth, railHeight, d + 0.08, edgeMaterial, 0.02);
          rail.position.set(sign * (w / 2 - railInset), h / 2 + COURSE_RAIL.elevation, 0);
          this.mesh.add(rail);
        }
      } else {
        for (const sign of [-1, 1]) {
          const rail = createRoundedBar(w + 0.08, railHeight, railWidth, edgeMaterial, 0.02);
          rail.position.set(0, h / 2 + COURSE_RAIL.elevation, sign * (d / 2 - railInset));
          this.mesh.add(rail);
        }
      }

      if (this.surfaceType !== SurfaceType.Normal) return;

      // Sparse center ticks make speed legible without turning the track into
      // a texture sheet. Long segments get more reference marks.
      const longAxis = Math.max(w, d);
      const tickCount = Math.max(1, Math.floor(longAxis / 5));
      const tickMaterial = createEnergyMaterial(0x9ee8ff, 0.3, 0.55);
      for (let i = 0; i < tickCount; i++) {
        const along = ((i + 1) / (tickCount + 1) - 0.5) * longAxis;
        const tick = this.travelAxis === "z"
          ? createRoundedBar(Math.min(0.52, w * 0.22), 0.018, 0.055, tickMaterial, 0.018)
          : createRoundedBar(0.055, 0.018, Math.min(0.52, d * 0.22), tickMaterial, 0.018);
        tick.position.set(this.travelAxis === "z" ? 0 : along, h / 2 + 0.052, this.travelAxis === "z" ? along : 0);
        this.mesh.add(tick);
      }
      return;
    }

    if (this.surfaceType === SurfaceType.Crumbling || this.surfaceType === SurfaceType.Invisible) {
      return;
    }

    const colorObj = new THREE.Color(color);
    const panelColor = colorObj.clone().lerp(new THREE.Color(0xffffff), isBridge ? 0.1 : 0.16).getHex();
    const panelInset = Math.min(0.42, w * 0.12, d * 0.12);
    const panel = createRoundedPanel(
      Math.max(0.2, w - panelInset),
      Math.max(0.2, d - panelInset),
      panelColor,
      emissive,
      (this.surfaceType === SurfaceType.Lava ? 0.68 : 0.82) * PLATFORM_OPACITY,
    );
    panel.position.y = h / 2 + 0.018;
    this.mesh.add(panel);

    const accentColor = emissive || (isBridge ? 0xd8b778 : 0x76a9ff);
    const stripMat = createEnergyMaterial(accentColor, 0.38, 0.55);
    const stripOffset = 0.14;
    const stripH = 0.026;
    const stripT = 0.055;

    if (w >= d) {
      for (const sign of [-1, 1]) {
        const strip = createRoundedBar(Math.max(0.4, w - 0.35), stripH, stripT, stripMat, 0.025);
        strip.position.set(0, h / 2 + 0.052, sign * (d / 2 - stripOffset));
        this.mesh.add(strip);
      }
    } else {
      for (const sign of [-1, 1]) {
        const strip = createRoundedBar(stripT, stripH, Math.max(0.4, d - 0.35), stripMat, 0.025);
        strip.position.set(sign * (w / 2 - stripOffset), h / 2 + 0.052, 0);
        this.mesh.add(strip);
      }
    }
  }

  private getSurfaceTexture(): THREE.Texture | undefined {
    const source = this.surfaceType === SurfaceType.Lava
      ? getLavaFlowTexture()
      : this.surfaceType === SurfaceType.Ice
        ? getIceSurfaceTexture()
        : this.surfaceType === SurfaceType.Crumbling
          ? getCrackTexture()
          : null;
    if (!source) return undefined;
    this.surfaceTexture = source.clone();
    this.surfaceTexture.needsUpdate = true;
    return this.surfaceTexture;
  }
}
