import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Physics } from "../physics";
import { PathSegment, SurfaceType, type PathSegmentDef } from "../objects/Path";
import { Bridge, type BridgeDef } from "../objects/Bridge";
import { LatticeWall, type LatticeWallDef } from "../objects/LatticeWall";
import { Obstacle, type ObstacleDef } from "../objects/Obstacle";
import { FinishZone, StartMarker, type FinishZoneDef } from "../objects/FinishZone";
import { WindZone, type WindZoneDef } from "../objects/WindZone";
import { TimedGate, type TimedGateDef } from "../objects/TimedGate";
import { Debris } from "../objects/Debris";
import type { Ball } from "../objects/Ball";
import type { PowerUpType } from "../powerups/PowerUpType";
import { CONFIG } from "../config";
import { playBounce, playShatter, playLavaHiss, playCrumble } from "../audio";

export interface LevelData {
  name: string;
  startPosition: [number, number, number];
  finishZone: FinishZoneDef;
  paths: PathSegmentDef[];
  bridges?: BridgeDef[];
  latticeWalls?: LatticeWallDef[];
  obstacles?: ObstacleDef[];
  windZones?: WindZoneDef[];
  timedGates?: TimedGateDef[];
}

export class Level {
  pathSegments: PathSegment[] = [];
  bridges: Bridge[] = [];
  latticeWalls: LatticeWall[] = [];
  obstacles: Obstacle[] = [];
  windZones: WindZone[] = [];
  timedGates: TimedGate[] = [];
  finishZone!: FinishZone;
  startMarker!: StartMarker;
  startPosition: [number, number, number];
  name: string;
  pendingShake = 0;
  pendingReset = false;
  boxesBroken = 0;
  powerUpsCollected = 0;

  onPowerUpCollected?: (type: PowerUpType) => void;

  private scene: THREE.Scene;
  private physics: Physics;
  private data: LevelData;
  private sceneObjects: THREE.Object3D[] = [];
  private debris: Debris[] = [];
  private bodyToObstacle = new Map<CANNON.Body, Obstacle>();
  private collideHandler: ((event: { body: CANNON.Body; contact: CANNON.ContactEquation }) => void) | null = null;
  private ball: Ball | null = null;
  private lavaTimers = new Map<PathSegment, number>();
  private lavaHissPlayed = new Set<PathSegment>();
  private bounceCooldown = 0;

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

    if (this.data.windZones) {
      for (const def of this.data.windZones) {
        this.windZones.push(new WindZone(this.scene, def));
      }
    }

    if (this.data.timedGates) {
      for (const def of this.data.timedGates) {
        this.timedGates.push(new TimedGate(this.scene, this.physics, def));
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
    this.boxesBroken++;

    // Check for power-up
    if (obstacle.powerUpType) {
      this.powerUpsCollected++;
      this.onPowerUpCollected?.(obstacle.powerUpType);
    }

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
    for (const wz of this.windZones) this.sceneObjects.push(wz.mesh);
    for (const tg of this.timedGates) this.sceneObjects.push(tg.mesh);
    this.sceneObjects.push(this.finishZone.mesh);
    this.sceneObjects.push(this.startMarker.mesh);
  }

  update(dt: number) {
    for (const o of this.obstacles) {
      if (!o.destroyed) o.update(dt);
    }
    this.finishZone.update(dt);

    if (this.ball) {
      for (const wz of this.windZones) {
        wz.applyForce(this.ball);
      }

      // Surface interactions
      const ballPos = this.ball.body.position;
      const ballR = CONFIG.ball.radius;

      // Track which lava segments ball is currently on
      const activeLavaSegments = new Set<PathSegment>();

      for (const seg of this.pathSegments) {
        if (seg.crumbled) continue;

        // AABB overlap check: ball vs segment top surface
        const mp = seg.mesh.position;
        const [sw, sh, sd] = seg.size;
        const topY = mp.y + sh / 2;

        const onTop =
          ballPos.x >= mp.x - sw / 2 - ballR &&
          ballPos.x <= mp.x + sw / 2 + ballR &&
          ballPos.z >= mp.z - sd / 2 - ballR &&
          ballPos.z <= mp.z + sd / 2 + ballR &&
          ballPos.y >= topY - 0.1 &&
          ballPos.y <= topY + ballR + 0.5;

        if (!onTop) continue;

        switch (seg.surfaceType) {
          case SurfaceType.Lava: {
            activeLavaSegments.add(seg);
            const timer = (this.lavaTimers.get(seg) ?? 0) + dt;
            this.lavaTimers.set(seg, timer);
            if (!this.lavaHissPlayed.has(seg)) {
              this.lavaHissPlayed.add(seg);
              playLavaHiss();
            }
            if (timer >= CONFIG.surfaces.lava.damageTime) {
              this.pendingReset = true;
              this.pendingShake = 0.3;
            }
            break;
          }
          case SurfaceType.Bounce: {
            if (this.bounceCooldown <= 0) {
              const vel = this.ball!.body.velocity;
              vel.y = CONFIG.surfaces.bounce.impulse;
              this.bounceCooldown = 0.3;
              playBounce(8);
            }
            break;
          }
          case SurfaceType.Speed: {
            if (seg.speedDirection) {
              const force = CONFIG.surfaces.speed.force;
              this.ball!.body.applyForce(
                new CANNON.Vec3(
                  seg.speedDirection.x * force,
                  seg.speedDirection.y * force,
                  seg.speedDirection.z * force,
                ),
                this.ball!.body.position,
              );
            }
            break;
          }
          case SurfaceType.Crumbling: {
            if (seg.crumbleTimer < 0) {
              seg.startCrumble();
              playCrumble();
            }
            break;
          }
        }
      }

      // Reset lava timers for segments the ball left
      for (const [seg] of this.lavaTimers) {
        if (!activeLavaSegments.has(seg)) {
          this.lavaTimers.delete(seg);
          this.lavaHissPlayed.delete(seg);
        }
      }
    }

    if (this.bounceCooldown > 0) this.bounceCooldown -= dt;

    // Update path segment animations
    for (const seg of this.pathSegments) {
      seg.update(dt);
    }

    for (const tg of this.timedGates) {
      tg.update(dt, this.physics);
    }

    // Update debris, remove dead ones
    for (let i = this.debris.length - 1; i >= 0; i--) {
      if (!this.debris[i].update(dt)) {
        this.debris[i].destroy();
        this.debris.splice(i, 1);
      }
    }
  }

  restoreBoxes() {
    for (const o of this.obstacles) {
      if (o.destroyed) {
        o.restore(this.scene, this.physics);
        this.bodyToObstacle.set(o.body, o);
      }
    }
    // Restore crumbled path segments
    for (const seg of this.pathSegments) {
      seg.restore();
    }
    // Clear lava timers on reset
    this.lavaTimers.clear();
    this.lavaHissPlayed.clear();
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
      if (!p.crumbled) {
        this.physics.removeBody(p.body);
        for (const w of p.walls) this.physics.removeBody(w.body);
      }
    }
    for (const b of this.bridges) this.physics.removeBody(b.body);
    for (const l of this.latticeWalls) {
      for (const body of l.bodies) this.physics.removeBody(body);
    }
    for (const o of this.obstacles) {
      if (!o.destroyed) this.physics.removeBody(o.body);
    }
    for (const tg of this.timedGates) {
      // Body may have been removed during off-cycle
      try { this.physics.removeBody(tg.body); } catch { /* already removed */ }
    }

    // Cleanup debris
    for (const d of this.debris) d.destroy();
    this.debris = [];
    this.bodyToObstacle.clear();

    this.pathSegments = [];
    this.bridges = [];
    this.latticeWalls = [];
    this.obstacles = [];
    this.windZones = [];
    this.timedGates = [];
  }
}
