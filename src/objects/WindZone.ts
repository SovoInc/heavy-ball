import * as THREE from "three";
import * as CANNON from "cannon-es";
import type { Ball } from "./Ball";

export interface WindZoneDef {
  position: [number, number, number];
  size: [number, number, number];
  direction: [number, number, number];
  strength: number;
}

const LEAF_COUNT = 40;

function createLeafTexture(): THREE.CanvasTexture {
  const size = 16;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  // Simple leaf shape — an ellipse with a slight taper
  ctx.fillStyle = "#66aa44";
  ctx.beginPath();
  ctx.ellipse(8, 8, 6, 3, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

let sharedLeafTex: THREE.CanvasTexture | null = null;
function getLeafTexture(): THREE.CanvasTexture {
  if (!sharedLeafTex) sharedLeafTex = createLeafTexture();
  return sharedLeafTex;
}

interface Leaf {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number; // for wobble
}

export class WindZone {
  private min: THREE.Vector3;
  private max: THREE.Vector3;
  private force: CANNON.Vec3;
  private direction: THREE.Vector3;
  private size: THREE.Vector3;
  private center: THREE.Vector3;
  private leaves: Leaf[] = [];
  private points: THREE.Points;

  // Exposed as `mesh` for scene cleanup compatibility
  mesh: THREE.Object3D;

  constructor(scene: THREE.Scene, def: WindZoneDef) {
    const [px, py, pz] = def.position;
    const [sx, sy, sz] = def.size;

    this.min = new THREE.Vector3(px - sx / 2, py - sy / 2, pz - sz / 2);
    this.max = new THREE.Vector3(px + sx / 2, py + sy / 2, pz + sz / 2);
    this.center = new THREE.Vector3(px, py, pz);
    this.size = new THREE.Vector3(sx, sy, sz);

    const [dx, dy, dz] = def.direction;
    this.direction = new THREE.Vector3(dx, dy, dz).normalize();
    this.force = new CANNON.Vec3(
      dx * def.strength,
      dy * def.strength,
      dz * def.strength,
    );

    // Create leaf particles
    const positions = new Float32Array(LEAF_COUNT * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      map: getLeafTexture(),
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.NormalBlending,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geo, mat);
    scene.add(this.points);
    this.mesh = this.points;

    // Initialize leaves at random positions within the zone
    for (let i = 0; i < LEAF_COUNT; i++) {
      this.leaves.push({
        position: new THREE.Vector3(
          px + (Math.random() - 0.5) * sx,
          py + (Math.random() - 0.5) * sy,
          pz + (Math.random() - 0.5) * sz,
        ),
        velocity: new THREE.Vector3(
          this.direction.x * def.strength * (0.5 + Math.random() * 0.5),
          0,
          this.direction.z * def.strength * (0.5 + Math.random() * 0.5),
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }
    this.syncPositions();
  }

  private syncPositions() {
    const posArr = this.points.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < this.leaves.length; i++) {
      const lf = this.leaves[i];
      posArr.setXYZ(i, lf.position.x, lf.position.y, lf.position.z);
    }
    posArr.needsUpdate = true;
  }

  update(dt: number) {
    for (const lf of this.leaves) {
      lf.phase += dt * 3;

      // Move in wind direction with some wobble
      lf.position.x += lf.velocity.x * dt;
      lf.position.y += Math.sin(lf.phase) * 0.5 * dt; // gentle up-down wobble
      lf.position.z += lf.velocity.z * dt;

      // Wrap around: if leaf exits zone, respawn on the upwind side
      if (lf.position.x > this.max.x) lf.position.x = this.min.x;
      if (lf.position.x < this.min.x) lf.position.x = this.max.x;
      if (lf.position.z > this.max.z) lf.position.z = this.min.z;
      if (lf.position.z < this.min.z) lf.position.z = this.max.z;

      // Keep y within bounds
      if (lf.position.y > this.max.y) lf.position.y = this.max.y;
      if (lf.position.y < this.min.y) lf.position.y = this.min.y;
    }
    this.syncPositions();
  }

  applyForce(ball: Ball) {
    const p = ball.position;
    if (
      p.x >= this.min.x && p.x <= this.max.x &&
      p.y >= this.min.y && p.y <= this.max.y &&
      p.z >= this.min.z && p.z <= this.max.z
    ) {
      ball.body.applyForce(this.force);
    }
  }
}
