import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Physics } from "../physics";
import { PathSegment, type PathSegmentDef } from "../objects/Path";
import { Bridge, type BridgeDef } from "../objects/Bridge";
import { LatticeWall, type LatticeWallDef } from "../objects/LatticeWall";
import { Obstacle, type ObstacleDef } from "../objects/Obstacle";
import { FinishZone, StartMarker, type FinishZoneDef } from "../objects/FinishZone";
import { Debris } from "../objects/Debris";
import type { Ball } from "../objects/Ball";
import { CONFIG } from "../config";
import { playBounce, playShatter } from "../audio";

export interface LevelData {
  name: string;
  startPosition: [number, number, number];
  finishZone: FinishZoneDef;
  paths: PathSegmentDef[];
  bridges?: BridgeDef[];
  latticeWalls?: LatticeWallDef[];
  obstacles?: ObstacleDef[];
}

export class Level {
  pathSegments: PathSegment[] = [];
  bridges: Bridge[] = [];
  latticeWalls: LatticeWall[] = [];
  obstacles: Obstacle[] = [];
  finishZone!: FinishZone;
  startMarker!: StartMarker;
  startPosition: [number, number, number];
  name: string;
  pendingShake = 0;

  private scene: THREE.Scene;
  private physics: Physics;
  private data: LevelData;
  private sceneObjects: THREE.Object3D[] = [];
  private debris: Debris[] = [];
  private bodyToObstacle = new Map<CANNON.Body, Obstacle>();
  private collideHandler: ((event: { body: CANNON.Body; contact: CANNON.ContactEquation }) => void) | null = null;
  private ball: Ball | null = null;

  constructor(
    scene: THREE.Scene,
    physics: Physics,
    data: LevelData,
  ) {
    this.scene = scene;
    this.physics = physics;
    this.data = data;
    this.name = data.name;
    this.startPosition = data.startPosition;
  }

  build(ball: Ball) {
    this.ball = ball;

    for (const def of this.data.paths) {
      this.pathSegments.push(new PathSegment(this.scene, this.physics, def));
    }

    if (this.data.bridges) {
      for (const def of this.data.bridges) {
        this.bridges.push(new Bridge(this.scene, this.physics, def));
      }
    }

    if (this.data.latticeWalls) {
      for (const def of this.data.latticeWalls) {
        this.latticeWalls.push(new LatticeWall(this.scene, this.physics, def));
      }
    }

    if (this.data.obstacles) {
      for (const def of this.data.obstacles) {
        const obstacle = new Obstacle(this.scene, this.physics, def);
        this.obstacles.push(obstacle);
        this.bodyToObstacle.set(obstacle.body, obstacle);
      }
    }

    this.finishZone = new FinishZone(this.scene, this.data.finishZone);
    this.startMarker = new StartMarker(this.scene, this.data.startPosition);

    this.collideHandler = (event) => this.onBallCollide(event);
    ball.body.addEventListener("collide", this.collideHandler);

    this.trackObjects();
  }

  private onBallCollide(event: { body: CANNON.Body; contact: CANNON.ContactEquation }) {
    const impactSpeed = Math.abs(event.contact.getImpactVelocityAlongNormal());

    const obstacle = this.bodyToObstacle.get(event.body);
    if (!obstacle || !obstacle.breakable || obstacle.destroyed) {
      // Bounce sound for any collision
      if (impactSpeed > 1) playBounce(impactSpeed);
      return;
    }

    if (impactSpeed < CONFIG.breakable.speedThreshold) {
      playBounce(impactSpeed);
      return;
    }

    obstacle.destroyed = true;
    playShatter();

    // Spawn debris
    const pos = new THREE.Vector3(
      obstacle.mesh.position.x,
      obstacle.mesh.position.y,
      obstacle.mesh.position.z,
    );
    this.debris.push(new Debris(this.scene, pos, obstacle.color, obstacle.size));

    // Remove obstacle from scene and physics
    this.scene.remove(obstacle.mesh);
    this.physics.removeBody(obstacle.body);
    this.bodyToObstacle.delete(obstacle.body);

    this.pendingShake = 0.25;
  }

  private trackObjects() {
    for (const p of this.pathSegments) {
      this.sceneObjects.push(p.mesh);
      for (const w of p.walls) this.sceneObjects.push(w.mesh);
    }
    for (const b of this.bridges) this.sceneObjects.push(b.mesh);
    for (const l of this.latticeWalls) this.sceneObjects.push(l.group);
    for (const o of this.obstacles) this.sceneObjects.push(o.mesh);
    this.sceneObjects.push(this.finishZone.mesh);
    this.sceneObjects.push(this.startMarker.mesh);
  }

  update(dt: number) {
    for (const o of this.obstacles) {
      if (!o.destroyed) o.update(dt);
    }
    this.finishZone.update(dt);

    // Update debris, remove dead ones
    for (let i = this.debris.length - 1; i >= 0; i--) {
      if (!this.debris[i].update(dt)) {
        this.debris[i].destroy();
        this.debris.splice(i, 1);
      }
    }
  }

  isComplete(ball: Ball): boolean {
    return this.finishZone.containsBall(ball);
  }

  destroy() {
    // Remove collision listener
    if (this.ball && this.collideHandler) {
      this.ball.body.removeEventListener("collide", this.collideHandler);
      this.collideHandler = null;
      this.ball = null;
    }

    for (const obj of this.sceneObjects) {
      this.scene.remove(obj);
    }
    this.sceneObjects = [];

    for (const p of this.pathSegments) {
      this.physics.removeBody(p.body);
      for (const w of p.walls) this.physics.removeBody(w.body);
    }
    for (const b of this.bridges) this.physics.removeBody(b.body);
    for (const l of this.latticeWalls) {
      for (const body of l.bodies) this.physics.removeBody(body);
    }
    for (const o of this.obstacles) {
      if (!o.destroyed) this.physics.removeBody(o.body);
    }

    // Cleanup debris
    for (const d of this.debris) d.destroy();
    this.debris = [];
    this.bodyToObstacle.clear();

    this.pathSegments = [];
    this.bridges = [];
    this.latticeWalls = [];
    this.obstacles = [];
  }
}
