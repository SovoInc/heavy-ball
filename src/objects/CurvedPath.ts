import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CONFIG } from "../config";
import { SurfaceType } from "./Path";
import { Physics } from "../physics";
import {
  createCrackTexture,
  createEnergyMaterial,
  createRoundedBoxGeometry,
  createSciFiMaterial,
  getFireSpriteTexture,
  getSnowflakeSpriteTexture,
} from "./visuals";

export interface CurvedPathSegmentDef {
  center: [number, number, number];
  radius: number;
  trackWidth: number;
  height: number;
  startAngle: number;
  arcAngle: number;
  walls?: boolean;
  surfaceType?: SurfaceType;
}

export class CurvedPathSegment {
  mesh: THREE.Mesh;
  bodies: CANNON.Body[] = [];
  walls: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
  surfaceType: SurfaceType;
  crumbleTimer = -1;
  crumbled = false;
  private respawnTimer = -1;

  readonly center: [number, number, number];
  readonly radius: number;
  readonly trackWidth: number;
  readonly height: number;
  readonly startAngle: number;
  readonly arcAngle: number;
  readonly innerR: number;
  readonly outerR: number;

  private physics: Physics;
  private scene: THREE.Scene;
  private animTime = 0;
  private material: THREE.MeshStandardMaterial;
  private fireParticles: THREE.Points | null = null;
  private fireData: { y: number; phase: number; speed: number; wobble: number; baseX: number; baseZ: number }[] = [];
  private fireTopY = 0;
  private fireRise = 1.4;
  private frostParticles: THREE.Points | null = null;
  private frostData: { y: number; speed: number; baseX: number; baseZ: number; swayPhase: number; swaySpeed: number; swayAmp: number }[] = [];
  private snowTopY = 0;
  private snowBottomY = 0;
  private arrowMeshes: THREE.Mesh[] = [];
  private arrowMaterials: THREE.MeshBasicMaterial[] = [];
  extraSceneObjects: THREE.Object3D[] = [];

  constructor(
    scene: THREE.Scene,
    physics: Physics,
    def: CurvedPathSegmentDef,
  ) {
    this.scene = scene;
    this.physics = physics;
    this.center = def.center;
    this.radius = def.radius;
    this.trackWidth = def.trackWidth;
    this.height = def.height;
    this.startAngle = def.startAngle;
    this.arcAngle = def.arcAngle;
    this.innerR = def.radius - def.trackWidth / 2;
    this.outerR = def.radius + def.trackWidth / 2;
    this.surfaceType = def.surfaceType ?? SurfaceType.Normal;

    const [cx, cy, cz] = def.center;

    // --- Material setup ---
    let color: number;
    let emissive = 0x000000;
    let emissiveIntensity = 0;

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
        color = CONFIG.colors.path;
        break;
    }

    // --- Visual mesh: extruded ring sector ---
    const shape = new THREE.Shape();
    const segments = 32;
    const innerR = this.innerR;
    const outerR = this.outerR;
    const sa = def.startAngle;
    const aa = def.arcAngle;

    // Outer arc
    // Shape lives in XY; after rotateX(-PI/2) → (x, z, -y) in world.
    // So shape Y must be negated to get correct world Z: use -sin(a).
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const a = sa + aa * t;
      const sx = Math.cos(a) * outerR;
      const sy = -Math.sin(a) * outerR;
      if (i === 0) shape.moveTo(sx, sy);
      else shape.lineTo(sx, sy);
    }
    // Inner arc (reversed)
    for (let i = segments; i >= 0; i--) {
      const t = i / segments;
      const a = sa + aa * t;
      const sx = Math.cos(a) * innerR;
      const sy = -Math.sin(a) * innerR;
      shape.lineTo(sx, sy);
    }
    shape.closePath();

    const platformRadius = Math.min(0.22, def.trackWidth * 0.08, def.height * 0.45);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: def.height,
      bevelEnabled: true,
      bevelThickness: platformRadius * 0.45,
      bevelSize: platformRadius * 0.45,
      bevelSegments: 4,
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // ExtrudeGeometry extrudes along Z. We need it along Y.
    // Rotate geometry: swap Y and Z by rotating -90° around X
    geo.rotateX(-Math.PI / 2);
    // Shift so bottom is at cy - height/2
    geo.translate(cx, cy - def.height / 2, cz);

    this.material = createSciFiMaterial({
      color,
      roughness: this.surfaceType === SurfaceType.Ice ? 0.16 : this.surfaceType === SurfaceType.Lava ? 0.42 : 0.58,
      metalness: this.surfaceType === SurfaceType.Ice ? 0.55 : this.surfaceType === SurfaceType.Lava ? 0.08 : 0.28,
      emissive,
      emissiveIntensity,
      map: this.surfaceType === SurfaceType.Crumbling ? getCrackTexture() : undefined,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.addCurvedTrim(def, emissive || 0x76a9ff);

    // --- Physics: N box segments along the arc ---
    const boxCount = Math.max(4, Math.ceil(Math.abs(aa) / (Math.PI / 12)));
    const physicsMat = this.getPhysicsMaterial(physics);

    for (let i = 0; i < boxCount; i++) {
      const t = (i + 0.5) / boxCount;
      const angle = sa + aa * t;
      const midX = cx + Math.cos(angle) * def.radius;
      const midZ = cz + Math.sin(angle) * def.radius;

      // Box dimensions: length along arc, width = trackWidth
      const arcLen = (Math.abs(aa) / boxCount) * def.radius;
      const halfW = def.trackWidth / 2;
      const halfH = def.height / 2;
      const halfL = arcLen / 2;

      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(halfW, halfH, halfL)),
        material: physicsMat,
      });
      body.position.set(midX, cy, midZ);
      // Rotate so local X = radial (trackWidth) and local Z = tangent (arcLen)
      // With euler(0, -angle, 0): localX→(cosθ,0,sinθ), localZ→(-sinθ,0,cosθ)
      body.quaternion.setFromEuler(0, -angle, 0);
      physics.addBody(body);
      this.bodies.push(body);
    }

    // --- Walls ---
    if (def.walls) {
      this.addCurvedWalls(scene, physics, def);
    }

    // --- Particles ---
    if (this.surfaceType === SurfaceType.Lava) {
      this.addFireParticles(def);
    }
    if (this.surfaceType === SurfaceType.Ice) {
      this.addFrostParticles(def);
    }
    if (this.surfaceType === SurfaceType.Speed) {
      this.addSpeedArrows(def);
    }
  }

  private getPhysicsMaterial(physics: Physics): CANNON.Material {
    switch (this.surfaceType) {
      case SurfaceType.Ice: return physics.iceMaterial;
      case SurfaceType.Bounce: return physics.bounceMaterial;
      default: return physics.groundMaterial;
    }
  }

  private addCurvedWalls(scene: THREE.Scene, physics: Physics, def: CurvedPathSegmentDef) {
    const [cx, cy, cz] = def.center;
    const wallH = CONFIG.path.wallHeight;
    const wallT = CONFIG.path.wallThickness;
    const collisionT = 1.5;
    const wy = cy + def.height / 2 + wallH / 2;

    const boxCount = Math.max(4, Math.ceil(Math.abs(def.arcAngle) / (Math.PI / 12)));

    for (const edgeR of [this.innerR, this.outerR]) {
      const isOuter = edgeR === this.outerR;
      const visualR = isOuter ? edgeR + wallT / 2 : edgeR - wallT / 2;
      const collisionR = isOuter ? edgeR + collisionT / 2 : edgeR - collisionT / 2;

      for (let i = 0; i < boxCount; i++) {
        const t = (i + 0.5) / boxCount;
        const angle = def.startAngle + def.arcAngle * t;
        const arcLen = (Math.abs(def.arcAngle) / boxCount) * edgeR;

        // Visual wall — thin box oriented along tangent (local Z)
        const vx = cx + Math.cos(angle) * visualR;
        const vz = cz + Math.sin(angle) * visualR;
        const geo = createRoundedBoxGeometry(wallT, wallH, arcLen, Math.min(0.12, wallT * 0.45), 4);
        const mat = createEnergyMaterial(CONFIG.colors.pathEdge, 0.36, 0.55);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(vx, wy, vz);
        // Rotate so local X = radial (wall thickness), local Z = tangent (arc length)
        mesh.rotation.y = -angle;
        mesh.castShadow = true;
        scene.add(mesh);

        // Collision wall
        const colX = cx + Math.cos(angle) * collisionR;
        const colZ = cz + Math.sin(angle) * collisionR;
        const body = new CANNON.Body({
          mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(collisionT / 2, wallH / 2, arcLen / 2)),
          material: physics.wallMaterial,
        });
        body.position.set(colX, wy, colZ);
        body.quaternion.setFromEuler(0, -angle, 0);
        physics.addBody(body);

        this.walls.push({ mesh, body });
      }
    }
  }

  private addFireParticles(def: CurvedPathSegmentDef) {
    const [cx, cy, cz] = def.center;
    const area = Math.abs(def.arcAngle) * def.radius * def.trackWidth;
    const count = Math.round(area * 8);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const topY = cy + def.height / 2;
    this.fireTopY = topY;

    for (let i = 0; i < count; i++) {
      const angle = def.startAngle + Math.random() * def.arcAngle;
      const r = this.innerR + Math.random() * def.trackWidth;
      const bx = cx + Math.cos(angle) * r;
      const bz = cz + Math.sin(angle) * r;
      const startY = topY + Math.random() * this.fireRise;
      positions[i * 3] = bx;
      positions[i * 3 + 1] = startY;
      positions[i * 3 + 2] = bz;

      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 0.7;

      this.fireData.push({
        y: startY,
        phase: Math.random() * Math.PI * 2,
        speed: 0.9 + Math.random() * 1.2,
        wobble: 0.08 + Math.random() * 0.18,
        baseX: bx,
        baseZ: bz,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      map: getFireSpriteTexture(),
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
      alphaTest: 0.01,
    });

    this.fireParticles = new THREE.Points(geo, mat);
    this.scene.add(this.fireParticles);
    this.extraSceneObjects.push(this.fireParticles);
  }

  private addFrostParticles(def: CurvedPathSegmentDef) {
    const [cx, cy, cz] = def.center;
    const area = Math.abs(def.arcAngle) * def.radius * def.trackWidth;
    const count = Math.max(40, Math.round(area * 5));
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const topY = cy + def.height / 2;
    const fallTop = topY + 4.5;
    const fallBottom = topY + 0.05;
    this.snowTopY = fallTop;
    this.snowBottomY = fallBottom;

    for (let i = 0; i < count; i++) {
      const angle = def.startAngle + Math.random() * def.arcAngle;
      const r = this.innerR + Math.random() * def.trackWidth;
      const bx = cx + Math.cos(angle) * r;
      const bz = cz + Math.sin(angle) * r;
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
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      map: getSnowflakeSpriteTexture(),
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexColors: true,
      sizeAttenuation: true,
      alphaTest: 0.02,
    });

    this.frostParticles = new THREE.Points(geo, mat);
    this.scene.add(this.frostParticles);
    this.extraSceneObjects.push(this.frostParticles);
  }

  private addSpeedArrows(def: CurvedPathSegmentDef) {
    const arrowCount = Math.max(3, Math.ceil(Math.abs(def.arcAngle) / (Math.PI / 6)));
    const [cx, cy, cz] = def.center;

    for (let i = 0; i < arrowCount; i++) {
      const t = (i + 0.5) / arrowCount;
      const angle = def.startAngle + def.arcAngle * t;
      const mx = cx + Math.cos(angle) * def.radius;
      const mz = cz + Math.sin(angle) * def.radius;

      const arrowGeo = createChevronGeometry(def.trackWidth * 0.55);
      const arrowMat = new THREE.MeshBasicMaterial({
        color: 0x7dccff,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
      arrowMesh.rotation.x = -Math.PI / 2;
      arrowMesh.position.set(mx, cy + def.height / 2 + 0.05, mz);

      // Rotate to point along tangent
      const tangentAngle = angle + (def.arcAngle > 0 ? Math.PI / 2 : -Math.PI / 2);
      arrowMesh.rotation.z = tangentAngle;

      this.scene.add(arrowMesh);
      this.arrowMeshes.push(arrowMesh);
      this.arrowMaterials.push(arrowMat);
      this.extraSceneObjects.push(arrowMesh);
    }
  }

  update(dt: number) {
    this.animTime += dt;

    if (this.surfaceType === SurfaceType.Lava) {
      const pulse = 0.4 + Math.sin(this.animTime * 3) * 0.3;
      this.material.emissiveIntensity = pulse;

      if (this.fireParticles) {
        const posArr = this.fireParticles.geometry.attributes.position as THREE.BufferAttribute;
        const colArr = this.fireParticles.geometry.attributes.color as THREE.BufferAttribute;
        const topY = this.fireTopY;
        const rise = this.fireRise;

        for (let i = 0; i < this.fireData.length; i++) {
          const fd = this.fireData[i];
          fd.y += fd.speed * dt;
          fd.phase += dt * (3 + fd.speed);

          const life = Math.max(0, Math.min(1, (fd.y - topY) / rise));
          const wobbleScale = fd.wobble * (0.4 + life * 1.2);
          const wx = fd.baseX + Math.sin(fd.phase) * wobbleScale;
          const wz = fd.baseZ + Math.cos(fd.phase * 0.7) * wobbleScale;
          posArr.setXYZ(i, wx, fd.y, wz);

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

          if (fd.y > topY + rise) {
            fd.y = topY + Math.random() * 0.05;
            fd.phase = Math.random() * Math.PI * 2;
            fd.speed = 0.9 + Math.random() * 1.2;
          }
        }
        posArr.needsUpdate = true;
        colArr.needsUpdate = true;
      }
    }

    if (this.surfaceType === SurfaceType.Ice) {
      const shimmer = 0.2 + Math.sin(this.animTime * 1.5) * 0.1;
      this.material.emissiveIntensity = shimmer;

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
      const breath = 0.3 + Math.sin(this.animTime * 2) * 0.2;
      this.material.emissiveIntensity = breath;
    }

    if (this.surfaceType === SurfaceType.Speed) {
      for (const mat of this.arrowMaterials) {
        mat.opacity = 0.3 + Math.sin(this.animTime * 3) * 0.2;
      }
    }

    if (this.surfaceType === SurfaceType.Crumbling && this.crumbleTimer >= 0 && !this.crumbled) {
      this.crumbleTimer -= dt;
      const remaining = this.crumbleTimer / CONFIG.surfaces.crumbling.delay;
      this.material.opacity = Math.max(0, remaining);
      this.material.transparent = true;

      if (this.crumbleTimer <= 0) {
        this.crumbled = true;
        this.mesh.visible = false;
        for (const b of this.bodies) this.physics.removeBody(b);
        for (const w of this.walls) {
          w.mesh.visible = false;
          this.physics.removeBody(w.body);
        }
        for (const obj of this.extraSceneObjects) obj.visible = false;
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

    for (const b of this.bodies) this.physics.addBody(b);
    for (const w of this.walls) {
      w.mesh.visible = true;
      this.physics.addBody(w.body);
    }
    for (const obj of this.extraSceneObjects) obj.visible = true;
  }

  /** Check if a ball position overlaps this curved segment (polar check). */
  containsBall(bx: number, bz: number, ballR: number): boolean {
    const [cx, , cz] = this.center;
    const dx = bx - cx;
    const dz = bz - cz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < this.innerR - ballR || dist > this.outerR + ballR) return false;

    let angle = Math.atan2(dz, dx);
    // Normalize angle relative to startAngle
    return this.isAngleInArc(angle);
  }

  /** Get the tangent direction at a given ball position (for speed surfaces). */
  getTangentAt(bx: number, bz: number): THREE.Vector3 {
    const [cx, , cz] = this.center;
    const dx = bx - cx;
    const dz = bz - cz;
    const angle = Math.atan2(dz, dx);
    const sign = Math.sign(this.arcAngle);
    return new THREE.Vector3(-Math.sin(angle) * sign, 0, Math.cos(angle) * sign).normalize();
  }

  private isAngleInArc(angle: number): boolean {
    const sa = this.startAngle;
    const aa = this.arcAngle;

    // Normalize angle relative to startAngle into [0, 2PI)
    let rel = angle - sa;
    // Normalize to [0, 2PI) for positive arc, or (-2PI, 0] for negative
    if (aa > 0) {
      rel = ((rel % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      return rel <= aa + 0.05; // small tolerance
    } else {
      rel = ((rel % (Math.PI * 2)) - Math.PI * 2) % (Math.PI * 2);
      if (rel > 0) rel -= Math.PI * 2;
      return rel >= aa - 0.05; // small tolerance
    }
  }

  private addCurvedTrim(def: CurvedPathSegmentDef, color: number) {
    if (this.surfaceType === SurfaceType.Crumbling || this.surfaceType === SurfaceType.Invisible) {
      return;
    }

    const [cx, cy, cz] = def.center;
    const material = createEnergyMaterial(
      color,
      this.surfaceType === SurfaceType.Normal ? 0.22 : 0.38,
      0.55,
    );
    const tubeSegments = Math.max(8, Math.ceil(Math.abs(def.arcAngle) / (Math.PI / 32)));
    const topY = cy + def.height / 2 + 0.055;

    for (const edgeR of [this.innerR + 0.12, this.outerR - 0.12]) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= tubeSegments; i++) {
        const t = i / tubeSegments;
        const angle = def.startAngle + def.arcAngle * t;
        points.push(new THREE.Vector3(
          cx + Math.cos(angle) * edgeR,
          topY,
          cz + Math.sin(angle) * edgeR,
        ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const trim = new THREE.Mesh(
        new THREE.TubeGeometry(curve, tubeSegments, 0.025, 8, false),
        material,
      );
      trim.castShadow = false;
      this.scene.add(trim);
      this.extraSceneObjects.push(trim);
    }
  }
}

let sharedCrackTexture: THREE.CanvasTexture | null = null;
function getCrackTexture(): THREE.CanvasTexture {
  if (!sharedCrackTexture) sharedCrackTexture = createCrackTexture();
  return sharedCrackTexture;
}

function createChevronGeometry(size: number): THREE.ShapeGeometry {
  const s = size;
  const shape = new THREE.Shape();
  shape.moveTo(0, -s * 0.46);
  shape.lineTo(s * 0.38, -s * 0.08);
  shape.lineTo(s * 0.16, -s * 0.08);
  shape.lineTo(s * 0.16, s * 0.42);
  shape.lineTo(-s * 0.16, s * 0.42);
  shape.lineTo(-s * 0.16, -s * 0.08);
  shape.lineTo(-s * 0.38, -s * 0.08);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/**
 * Convert curved segment definitions to rectangular AABB approximations
 * for use in the level playability tests.
 */
export function curvedSegmentToAABBs(def: CurvedPathSegmentDef): {
  position: [number, number, number];
  size: [number, number, number];
  surfaceType?: SurfaceType;
}[] {
  const [cx, cy, cz] = def.center;
  const innerR = def.radius - def.trackWidth / 2;
  const outerR = def.radius + def.trackWidth / 2;
  const boxCount = Math.max(4, Math.ceil(Math.abs(def.arcAngle) / (Math.PI / 12)));
  const results: { position: [number, number, number]; size: [number, number, number]; surfaceType?: SurfaceType }[] = [];

  for (let i = 0; i < boxCount; i++) {
    const t = (i + 0.5) / boxCount;
    const angle = def.startAngle + def.arcAngle * t;
    const mx = cx + Math.cos(angle) * def.radius;
    const mz = cz + Math.sin(angle) * def.radius;

    const arcLen = (Math.abs(def.arcAngle) / boxCount) * def.radius;

    // Compute the bounding box of this arc slice
    // Approximate: use trackWidth and arcLen as the two extents, rotated
    const tangentAngle = angle + (def.arcAngle > 0 ? Math.PI / 2 : -Math.PI / 2);
    const absC = Math.abs(Math.cos(tangentAngle));
    const absS = Math.abs(Math.sin(tangentAngle));
    const sizeX = def.trackWidth * absC + arcLen * absS;
    const sizeZ = def.trackWidth * absS + arcLen * absC;

    results.push({
      position: [mx, cy, mz],
      size: [sizeX, def.height, sizeZ],
      surfaceType: def.surfaceType,
    });
  }

  return results;
}
