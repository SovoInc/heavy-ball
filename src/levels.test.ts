import { describe, it, expect } from "vitest";
import { CONFIG } from "./config";
import { SurfaceType } from "./objects/Path";
import type { PathSegmentDef } from "./objects/Path";
import type { LevelData } from "./levels/Level";

import { LEVEL_1 } from "./levels/Level1";
import { LEVEL_2 } from "./levels/Level2";
import { LEVEL_3 } from "./levels/Level3";
import { LEVEL_4 } from "./levels/Level4";
import { LEVEL_5 } from "./levels/Level5";
import { LEVEL_6 } from "./levels/Level6";
import { LEVEL_7 } from "./levels/Level7";
import { LEVEL_8 } from "./levels/Level8";
import { LEVEL_9 } from "./levels/Level9";
import { LEVEL_10 } from "./levels/Level10";
import { LEVEL_11 } from "./levels/Level11";
import { LEVEL_12 } from "./levels/Level12";
import { LEVEL_13 } from "./levels/Level13";
import { LEVEL_14 } from "./levels/Level14";
import { LEVEL_15 } from "./levels/Level15";
import { LEVEL_16 } from "./levels/Level16";
import { LEVEL_17 } from "./levels/Level17";
import { LEVEL_18 } from "./levels/Level18";
import { LEVEL_19 } from "./levels/Level19";
import { LEVEL_20 } from "./levels/Level20";

const ALL_LEVELS: LevelData[] = [
  LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5,
  LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10,
  LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15,
  LEVEL_16, LEVEL_17, LEVEL_18, LEVEL_19, LEVEL_20,
];

// Physics constants for reachability calculations
const GRAVITY = Math.abs(CONFIG.physics.gravity);
const BALL_RADIUS = CONFIG.ball.radius;
const BOUNCE_IMPULSE = CONFIG.surfaces.bounce.impulse;
const MAX_BOUNCE_HEIGHT = (BOUNCE_IMPULSE * BOUNCE_IMPULSE) / (2 * GRAVITY);

// Maximum gap the ball can cross while rolling at reasonable speed
const MAX_SAME_HEIGHT_GAP = 3.5;

interface AABB {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

function segmentAABB(seg: PathSegmentDef): AABB {
  const [px, py, pz] = seg.position;
  const [w, h, d] = seg.size;
  return {
    minX: px - w / 2, maxX: px + w / 2,
    minY: py - h / 2, maxY: py + h / 2,
    minZ: pz - d / 2, maxZ: pz + d / 2,
  };
}

function topY(seg: PathSegmentDef): number {
  return seg.position[1] + seg.size[1] / 2;
}

/** Compute horizontal (XZ) gap between two AABBs. 0 means overlapping. */
function horizontalGap(a: AABB, b: AABB): number {
  const dx = Math.max(0, Math.max(a.minX, b.minX) - Math.min(a.maxX, b.maxX));
  const dz = Math.max(0, Math.max(a.minZ, b.minZ) - Math.min(a.maxZ, b.maxZ));
  return Math.sqrt(dx * dx + dz * dz);
}

/** Check if two AABBs overlap horizontally (XZ plane) */
function aabbOverlapXZ(a: AABB, b: AABB): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX &&
         a.minZ <= b.maxZ && a.maxZ >= b.minZ;
}

/**
 * Get all walkable segments for a level: paths + bridges as PathSegmentDefs.
 */
function getWalkableSegments(level: LevelData): PathSegmentDef[] {
  const segments = [...level.paths];
  if (level.bridges) {
    for (const b of level.bridges) {
      segments.push({
        position: b.position,
        size: [b.width, 0.3, b.length],
        isBridge: true,
      });
    }
  }
  return segments;
}

/**
 * Check if the ball can move from segment A to segment B.
 * Considers: rolling gaps, height drops, bounce pads.
 */
function canReach(a: PathSegmentDef, b: PathSegmentDef): boolean {
  const aBox = segmentAABB(a);
  const bBox = segmentAABB(b);
  const gap = horizontalGap(aBox, bBox);
  const aTop = topY(a);
  const bTop = topY(b);
  const heightDiff = bTop - aTop;

  // Platforms overlap horizontally
  if (gap <= 0) {
    if (heightDiff <= BALL_RADIUS + 0.1) return true;
    if (a.surfaceType === SurfaceType.Bounce && heightDiff <= MAX_BOUNCE_HEIGHT) return true;
    return false;
  }

  // Going up with a gap — needs bounce
  if (heightDiff > BALL_RADIUS + 0.1) {
    if (a.surfaceType === SurfaceType.Bounce && heightDiff <= MAX_BOUNCE_HEIGHT) {
      const totalAirTime = 2 * BOUNCE_IMPULSE / GRAVITY;
      const maxHDist = CONFIG.ball.maxSpeed * totalAirTime;
      return gap <= maxHDist;
    }
    return false;
  }

  // Same height or going down — check rollable gap
  const fallDist = Math.max(0, Math.abs(heightDiff)) + BALL_RADIUS;
  const fallTime = Math.sqrt(2 * fallDist / GRAVITY);
  const maxCross = CONFIG.ball.maxSpeed * fallTime + 2 * BALL_RADIUS;
  const effectiveMax = Math.max(MAX_SAME_HEIGHT_GAP, maxCross);
  return gap <= effectiveMax;
}

/**
 * Find which segment index a point (x, z) overlaps with.
 * Returns index or -1.
 */
function findSegmentAt(x: number, z: number, segments: PathSegmentDef[]): number {
  for (let i = 0; i < segments.length; i++) {
    const bb = segmentAABB(segments[i]);
    if (x >= bb.minX - BALL_RADIUS && x <= bb.maxX + BALL_RADIUS &&
        z >= bb.minZ - BALL_RADIUS && z <= bb.maxZ + BALL_RADIUS) {
      return i;
    }
  }
  return -1;
}

/**
 * BFS from a set of start segments to see which segments are reachable.
 * Returns set of reachable segment indices.
 */
function findReachable(startIndices: number[], segments: PathSegmentDef[]): Set<number> {
  const visited = new Set<number>(startIndices);
  const queue = [...startIndices];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (let j = 0; j < segments.length; j++) {
      if (visited.has(j)) continue;
      if (canReach(segments[current], segments[j])) {
        visited.add(j);
        queue.push(j);
      }
    }
  }
  return visited;
}

describe("Level playability", () => {
  ALL_LEVELS.forEach((level, i) => {
    const levelNum = i + 1;

    describe(`Level ${levelNum} — ${level.name}`, () => {
      it("start position is above a platform", () => {
        const [sx, , sz] = level.startPosition;
        const segments = getWalkableSegments(level);
        const idx = findSegmentAt(sx, sz, segments);
        expect(idx, `start (${sx}, ${sz}) not above any platform`).not.toBe(-1);
      });

      it("finish zone overlaps a platform", () => {
        const fz = level.finishZone;
        const finishBox: AABB = {
          minX: fz.position[0] - fz.size[0] / 2, maxX: fz.position[0] + fz.size[0] / 2,
          minY: 0, maxY: 0,
          minZ: fz.position[2] - fz.size[2] / 2, maxZ: fz.position[2] + fz.size[2] / 2,
        };
        const segments = getWalkableSegments(level);
        const onPlatform = segments.some(seg => aabbOverlapXZ(finishBox, segmentAABB(seg)));
        expect(onPlatform, `finish zone at (${fz.position.join(",")}) doesn't overlap any platform`).toBe(true);
      });

      it("every platform is reachable from start", () => {
        const segments = getWalkableSegments(level);
        const [sx, , sz] = level.startPosition;
        const startIndices: number[] = [];
        for (let j = 0; j < segments.length; j++) {
          const bb = segmentAABB(segments[j]);
          if (sx >= bb.minX - BALL_RADIUS && sx <= bb.maxX + BALL_RADIUS &&
              sz >= bb.minZ - BALL_RADIUS && sz <= bb.maxZ + BALL_RADIUS) {
            startIndices.push(j);
          }
        }
        expect(startIndices.length, "start not on any platform").toBeGreaterThan(0);

        const reachable = findReachable(startIndices, segments);
        const unreachable: string[] = [];
        for (let j = 0; j < segments.length; j++) {
          if (!reachable.has(j)) {
            const s = segments[j];
            unreachable.push(
              `Segment ${j}: pos(${s.position.join(",")}) size(${s.size.join(",")})` +
              `${s.surfaceType ? ` [${s.surfaceType}]` : ""}` +
              `${s.isBridge ? " [bridge]" : ""}`
            );
          }
        }
        expect(unreachable, `Unreachable segments:\n${unreachable.join("\n")}`).toHaveLength(0);
      });

      it("lava and crumbling segments are crossable in time", () => {
        // Lava: ball must cross before damageTime (1.5s)
        // Crumbling: ball must cross before delay (2.0s)
        // Use a conservative crossing speed (half of maxSpeed) to account for
        // the ball not always entering at full speed
        const crossingSpeed = CONFIG.ball.maxSpeed * 0.5;
        const failures: string[] = [];

        for (let j = 0; j < level.paths.length; j++) {
          const seg = level.paths[j];
          if (!seg.surfaceType) continue;

          // Length along the longest horizontal axis
          const length = Math.max(seg.size[0], seg.size[2]);

          if (seg.surfaceType === SurfaceType.Lava) {
            const timeToGross = length / crossingSpeed;
            if (timeToGross > CONFIG.surfaces.lava.damageTime) {
              failures.push(
                `Segment ${j} [lava]: length ${length} takes ${timeToGross.toFixed(1)}s ` +
                `at speed ${crossingSpeed.toFixed(0)}, but lava kills in ${CONFIG.surfaces.lava.damageTime}s`
              );
            }
          }

          if (seg.surfaceType === SurfaceType.Crumbling) {
            const timeToCross = length / crossingSpeed;
            if (timeToCross > CONFIG.surfaces.crumbling.delay) {
              failures.push(
                `Segment ${j} [crumbling]: length ${length} takes ${timeToCross.toFixed(1)}s ` +
                `at speed ${crossingSpeed.toFixed(0)}, but crumbles in ${CONFIG.surfaces.crumbling.delay}s`
              );
            }
          }
        }

        expect(failures, failures.join("\n")).toHaveLength(0);
      });

      it("speed (conveyor) platforms with sideways push connect to neighbors", () => {
        // Conveyor platforms that push the ball sideways (X-axis direction)
        // with noWalls make gaps uncrossable — the ball gets pushed off the edge.
        // These platforms must connect seamlessly to their neighbors.
        // Conveyors pushing forward/backward (Z-axis) are fine with small gaps
        // since the force doesn't push the ball off the platform edge.
        const failures: string[] = [];

        for (let j = 0; j < level.paths.length; j++) {
          const seg = level.paths[j];
          if (seg.surfaceType !== SurfaceType.Speed) continue;
          if (!seg.direction) continue;

          // Only check conveyors that push sideways (X component)
          const pushesX = Math.abs(seg.direction[0]) > 0.1;
          if (!pushesX) continue;

          const segBox = segmentAABB(seg);

          // Find the closest neighbor in front and behind (Z-axis)
          let closestFrontGap = Infinity;
          let closestBackGap = Infinity;
          let frontIdx = -1;
          let backIdx = -1;

          for (let k = 0; k < level.paths.length; k++) {
            if (k === j) continue;
            const otherBox = segmentAABB(level.paths[k]);

            // Must overlap in X to be a forward/backward neighbor
            if (otherBox.maxX < segBox.minX || otherBox.minX > segBox.maxX) continue;

            // Behind the segment (higher Z = closer to start)
            const backDist = segBox.maxZ - otherBox.minZ;
            if (backDist >= -0.5 && backDist < closestBackGap) {
              const gap = horizontalGap(segBox, otherBox);
              if (gap < closestBackGap) { closestBackGap = gap; backIdx = k; }
            }

            // In front of the segment (lower Z = closer to finish)
            const frontDist = otherBox.maxZ - segBox.minZ;
            if (frontDist >= -0.5 && frontDist < closestFrontGap) {
              const gap = horizontalGap(segBox, otherBox);
              if (gap < closestFrontGap) { closestFrontGap = gap; frontIdx = k; }
            }
          }

          if (closestFrontGap > 0.5 && frontIdx >= 0) {
            failures.push(
              `Segment ${j} [speed, pushes X] has ${closestFrontGap.toFixed(1)} unit gap to front neighbor ${frontIdx} ` +
              `(pos ${seg.position.join(",")}) → (pos ${level.paths[frontIdx].position.join(",")})`
            );
          }
          if (closestBackGap > 0.5 && backIdx >= 0) {
            failures.push(
              `Segment ${j} [speed, pushes X] has ${closestBackGap.toFixed(1)} unit gap to back neighbor ${backIdx} ` +
              `(pos ${seg.position.join(",")}) → (pos ${level.paths[backIdx].position.join(",")})`
            );
          }
        }

        expect(failures, `Speed platform gaps:\n${failures.join("\n")}`).toHaveLength(0);
      });

      it("finish zone is reachable from start", () => {
        const segments = getWalkableSegments(level);
        const [sx, , sz] = level.startPosition;
        const fz = level.finishZone;
        const finishBox: AABB = {
          minX: fz.position[0] - fz.size[0] / 2, maxX: fz.position[0] + fz.size[0] / 2,
          minY: 0, maxY: 0,
          minZ: fz.position[2] - fz.size[2] / 2, maxZ: fz.position[2] + fz.size[2] / 2,
        };

        // Find start segments
        const startIndices: number[] = [];
        for (let j = 0; j < segments.length; j++) {
          const bb = segmentAABB(segments[j]);
          if (sx >= bb.minX - BALL_RADIUS && sx <= bb.maxX + BALL_RADIUS &&
              sz >= bb.minZ - BALL_RADIUS && sz <= bb.maxZ + BALL_RADIUS) {
            startIndices.push(j);
          }
        }

        const reachable = findReachable(startIndices, segments);

        // Check if any reachable segment overlaps the finish zone
        const canFinish = [...reachable].some(idx =>
          aabbOverlapXZ(segmentAABB(segments[idx]), finishBox)
        );
        expect(canFinish, "No reachable platform overlaps the finish zone").toBe(true);
      });
    });
  });
});
