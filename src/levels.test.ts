/**
 * Level Playability Rules
 * =======================
 * Every level is automatically validated against these rules.
 * A level that breaks any rule is unplayable and must be fixed.
 *
 * RULE 1: Start position must be on a platform
 * RULE 2: Finish zone must overlap a platform and ball Y must be inside it
 * RULE 3: Every platform must touch at least one neighbor (gap ≤ 0.1)
 *         - Bounce platforms exempt from height check (vertical jumps OK)
 *         - Teleport destination islands exempt (connected via portal)
 * RULE 4: Every platform must be reachable from start via BFS
 *         - Considers rolling, falling, bounce pads, and teleport pairs
 * RULE 5: Finish zone must be reachable from start
 * RULE 6: Timed hazards must be crossable
 *         - Lava: crossing time < damageTime at half max speed
 *         - Crumbling: crossing time < delay at half max speed
 *         - Shrinking: crossing time < time to shrink to nothing
 *         - Invisible: onTime must be enough to cross at half max speed
 * RULE 7: Speed conveyors with sideways push must connect seamlessly
 * RULE 8: Moving platforms must touch (not overlap) a neighbor at each extreme
 *         - Y-axis movers: rest position must touch a neighbor
 *         - Non-Y movers: at each extreme, edge touches but doesn't overlap
 *         - Layout: gap between neighbors = platform_depth + 2 * range
 *         - Minimum range: 1 unit
 * RULE 9: Moving platforms on Z-axis must have pause ≥ 0.5s for boarding
 * RULE 10: Teleport pads must be placed on platforms
 * RULE 11: Teleport pad pairs must be far apart (distance > 4× pad radius)
 * RULE 12: Platform widths within a level must not vary wildly (max ≤ 4× min)
 */

import { describe, it, expect } from "vitest";
import { CONFIG } from "./config";
import { SurfaceType } from "./objects/Path";
import type { PathSegmentDef } from "./objects/Path";
import type { LevelData } from "./levels/Level";
import { ALL_LEVELS } from "./levels/allLevels";
import { curvedSegmentToAABBs } from "./objects/CurvedPath";
import type { TeleportPairDef } from "./objects/TeleportPad";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const GRAVITY = Math.abs(CONFIG.physics.gravity);
const BALL_RADIUS = CONFIG.ball.radius;
const BOUNCE_IMPULSE = CONFIG.surfaces.bounce.impulse;
const MAX_BOUNCE_HEIGHT = (BOUNCE_IMPULSE * BOUNCE_IMPULSE) / (2 * GRAVITY);
const CROSSING_SPEED = CONFIG.ball.maxSpeed * 0.5; // conservative half-speed
const TOUCH_TOLERANCE = 0.1; // max gap to count as "touching"

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------
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

function horizontalGap(a: AABB, b: AABB): number {
  const dx = Math.max(0, Math.max(a.minX, b.minX) - Math.min(a.maxX, b.maxX));
  const dz = Math.max(0, Math.max(a.minZ, b.minZ) - Math.min(a.maxZ, b.maxZ));
  return Math.sqrt(dx * dx + dz * dz);
}

function aabbOverlapXZ(a: AABB, b: AABB): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX &&
         a.minZ <= b.maxZ && a.maxZ >= b.minZ;
}

// ---------------------------------------------------------------------------
// Walkable segment collection
// ---------------------------------------------------------------------------
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
  if (level.curvedPaths) {
    for (const cp of level.curvedPaths) {
      for (const aabb of curvedSegmentToAABBs(cp)) {
        segments.push(aabb);
      }
    }
  }
  return segments;
}

// ---------------------------------------------------------------------------
// Reachability (BFS)
// ---------------------------------------------------------------------------
function canReach(a: PathSegmentDef, b: PathSegmentDef): boolean {
  const aBox = segmentAABB(a);
  const bBox = segmentAABB(b);
  const gap = horizontalGap(aBox, bBox);
  const aTop = topY(a);
  const bTop = topY(b);
  const heightDiff = bTop - aTop;

  if (gap <= 0) {
    if (heightDiff <= BALL_RADIUS + 0.1) return true;
    if (a.surfaceType === SurfaceType.Bounce && heightDiff <= MAX_BOUNCE_HEIGHT) return true;
    return false;
  }

  if (heightDiff > BALL_RADIUS + 0.1) {
    if (a.surfaceType === SurfaceType.Bounce && heightDiff <= MAX_BOUNCE_HEIGHT) {
      const totalAirTime = 2 * BOUNCE_IMPULSE / GRAVITY;
      const maxHDist = CONFIG.ball.maxSpeed * totalAirTime;
      return gap <= maxHDist;
    }
    return false;
  }

  // Same height or going down
  const fallDist = Math.max(0, Math.abs(heightDiff)) + BALL_RADIUS;
  const fallTime = Math.sqrt(2 * fallDist / GRAVITY);
  const maxCross = CONFIG.ball.maxSpeed * fallTime + 2 * BALL_RADIUS;
  return gap <= maxCross;
}

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

function findReachable(startIndices: number[], segments: PathSegmentDef[], teleportPairs?: TeleportPairDef[]): Set<number> {
  const visited = new Set<number>(startIndices);
  const queue = [...startIndices];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const seg = segments[current];
    const segBox = segmentAABB(seg);

    if (teleportPairs) {
      for (const pair of teleportPairs) {
        for (const [padPos, destPos] of [
          [pair.a, pair.b],
          [pair.b, pair.a],
        ] as const) {
          const [px, , pz] = padPos;
          if (px >= segBox.minX - BALL_RADIUS && px <= segBox.maxX + BALL_RADIUS &&
              pz >= segBox.minZ - BALL_RADIUS && pz <= segBox.maxZ + BALL_RADIUS) {
            const [dx, , dz] = destPos;
            for (let j = 0; j < segments.length; j++) {
              if (visited.has(j)) continue;
              const bb = segmentAABB(segments[j]);
              if (dx >= bb.minX - BALL_RADIUS && dx <= bb.maxX + BALL_RADIUS &&
                  dz >= bb.minZ - BALL_RADIUS && dz <= bb.maxZ + BALL_RADIUS) {
                visited.add(j);
                queue.push(j);
              }
            }
          }
        }
      }
    }

    for (let j = 0; j < segments.length; j++) {
      if (visited.has(j)) continue;
      if (canReach(seg, segments[j])) {
        visited.add(j);
        queue.push(j);
      }
    }
  }
  return visited;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Level playability", () => {
  ALL_LEVELS.forEach((level, i) => {
    const levelNum = i + 1;

    describe(`Level ${levelNum} — ${level.name}`, () => {

      // RULE 1
      it("start position is above a platform", () => {
        const [sx, , sz] = level.startPosition;
        const segments = getWalkableSegments(level);
        const idx = findSegmentAt(sx, sz, segments);
        expect(idx, `start (${sx}, ${sz}) not above any platform`).not.toBe(-1);
      });

      // RULE 2
      it("finish zone overlaps a platform and ball can enter it", () => {
        const fz = level.finishZone;
        const finishBox: AABB = {
          minX: fz.position[0] - fz.size[0] / 2, maxX: fz.position[0] + fz.size[0] / 2,
          minY: fz.position[1] - fz.size[1] / 2, maxY: fz.position[1] + fz.size[1] / 2,
          minZ: fz.position[2] - fz.size[2] / 2, maxZ: fz.position[2] + fz.size[2] / 2,
        };
        const segments = getWalkableSegments(level);

        // Must overlap a platform in XZ
        const onPlatform = segments.some(seg => aabbOverlapXZ(finishBox, segmentAABB(seg)));
        expect(onPlatform, `finish zone at (${fz.position.join(",")}) doesn't overlap any platform in XZ`).toBe(true);

        // Ball standing on the overlapping platform must be inside the finish zone's Y range.
        // Ball Y = platform top + ball radius.
        const overlapping = segments.filter(seg => aabbOverlapXZ(finishBox, segmentAABB(seg)));
        const ballReaches = overlapping.some(seg => {
          const ballY = topY(seg) + BALL_RADIUS;
          return ballY >= finishBox.minY && ballY <= finishBox.maxY;
        });
        expect(ballReaches,
          `finish zone Y range [${finishBox.minY.toFixed(1)}, ${finishBox.maxY.toFixed(1)}] ` +
          `doesn't contain ball height on any overlapping platform ` +
          `(platform tops: ${overlapping.map(s => topY(s).toFixed(1)).join(", ")})`
        ).toBe(true);
      });

      // RULE 3
      it("every platform touches at least one neighbor (no gaps)", () => {
        const segments = getWalkableSegments(level);
        const failures: string[] = [];

        // Moving platforms and their neighbors are exempt from the static
        // touch check — their connectivity is validated by Rule 8 instead.
        const movingSegments = new Set<number>();
        const movingNeighborSegments = new Set<number>();
        for (let j = 0; j < level.paths.length; j++) {
          const seg = level.paths[j];
          if (!seg.platformMoving) continue;
          movingSegments.add(j);
          // Mark segments that a mover reaches at either extreme
          const { axis, range } = seg.platformMoving;
          for (const sign of [1, -1]) {
            const ePos: [number, number, number] = [
              seg.position[0] + axis[0] * range * sign,
              seg.position[1] + axis[1] * range * sign,
              seg.position[2] + axis[2] * range * sign,
            ];
            const eBox = segmentAABB({ position: ePos, size: seg.size });
            for (let k = 0; k < segments.length; k++) {
              if (k === j) continue;
              if (horizontalGap(eBox, segmentAABB(segments[k])) <= TOUCH_TOLERANCE) {
                movingNeighborSegments.add(k);
              }
            }
          }
        }

        // Find segments that sit under a teleport pad (exempt from touching)
        const teleportSegments = new Set<number>();
        if (level.teleportPairs) {
          for (const pair of level.teleportPairs) {
            for (const pos of [pair.a, pair.b]) {
              const idx = findSegmentAt(pos[0], pos[2], segments);
              if (idx >= 0) teleportSegments.add(idx);
            }
          }
        }

        for (let j = 0; j < segments.length; j++) {
          const seg = segments[j];
          const box = segmentAABB(seg);
          let minGap = Infinity;

          for (let k = 0; k < segments.length; k++) {
            if (k === j) continue;
            const other = segments[k];
            const otherBox = segmentAABB(other);
            const gap = horizontalGap(box, otherBox);
            const heightDiff = Math.abs(topY(seg) - topY(other));
            const hasBounce = seg.surfaceType === SurfaceType.Bounce ||
                              other.surfaceType === SurfaceType.Bounce;
            const maxHeight = hasBounce ? MAX_BOUNCE_HEIGHT : BALL_RADIUS + 0.5;
            if (heightDiff <= maxHeight) {
              minGap = Math.min(minGap, gap);
            }
          }

          if (minGap > TOUCH_TOLERANCE) {
            // Exempt: moving platforms bridge gaps via range (checked by Rule 8)
            if (movingSegments.has(j)) continue;
            // Exempt: this segment is reached by a moving platform at its extreme
            if (movingNeighborSegments.has(j)) continue;
            // Exempt: segment is part of a teleport-connected island
            if (teleportSegments.has(j)) continue;
            // Exempt: segment's island has a teleport connection
            let islandExempt = false;
            if (level.teleportPairs) {
              // Check if any teleport pad lands on a segment that touches this one
              for (const ts of teleportSegments) {
                const tsBox = segmentAABB(segments[ts]);
                const gapToTeleport = horizontalGap(box, tsBox);
                const heightToTeleport = Math.abs(topY(seg) - topY(segments[ts]));
                if (gapToTeleport <= TOUCH_TOLERANCE && heightToTeleport <= BALL_RADIUS + 0.5) {
                  islandExempt = true;
                  break;
                }
              }
            }
            if (islandExempt) continue;

            failures.push(
              `Segment ${j}: pos(${seg.position.join(",")}) size(${seg.size.join(",")}) ` +
              `gap=${minGap === Infinity ? "none" : minGap.toFixed(2)}`
            );
          }
        }

        expect(failures, `Platform gaps:\n${failures.join("\n")}`).toHaveLength(0);
      });

      // RULE 4
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

        const reachable = findReachable(startIndices, segments, level.teleportPairs);
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

      // RULE 5
      it("finish zone is reachable from start", () => {
        const segments = getWalkableSegments(level);
        const [sx, , sz] = level.startPosition;
        const fz = level.finishZone;
        const finishBox: AABB = {
          minX: fz.position[0] - fz.size[0] / 2, maxX: fz.position[0] + fz.size[0] / 2,
          minY: 0, maxY: 0,
          minZ: fz.position[2] - fz.size[2] / 2, maxZ: fz.position[2] + fz.size[2] / 2,
        };

        const startIndices: number[] = [];
        for (let j = 0; j < segments.length; j++) {
          const bb = segmentAABB(segments[j]);
          if (sx >= bb.minX - BALL_RADIUS && sx <= bb.maxX + BALL_RADIUS &&
              sz >= bb.minZ - BALL_RADIUS && sz <= bb.maxZ + BALL_RADIUS) {
            startIndices.push(j);
          }
        }

        const reachable = findReachable(startIndices, segments, level.teleportPairs);
        const canFinish = [...reachable].some(idx =>
          aabbOverlapXZ(segmentAABB(segments[idx]), finishBox)
        );
        expect(canFinish, "No reachable platform overlaps the finish zone").toBe(true);
      });

      // RULE 6
      it("timed hazards are crossable", () => {
        const failures: string[] = [];

        for (let j = 0; j < level.paths.length; j++) {
          const seg = level.paths[j];
          if (!seg.surfaceType) continue;

          const length = Math.max(seg.size[0], seg.size[2]);
          const crossTime = length / CROSSING_SPEED;

          if (seg.surfaceType === SurfaceType.Lava) {
            if (crossTime > CONFIG.surfaces.lava.damageTime) {
              failures.push(
                `Seg ${j} [lava]: ${crossTime.toFixed(1)}s to cross, kills in ${CONFIG.surfaces.lava.damageTime}s`
              );
            }
          }

          if (seg.surfaceType === SurfaceType.Crumbling) {
            if (crossTime > CONFIG.surfaces.crumbling.delay) {
              failures.push(
                `Seg ${j} [crumbling]: ${crossTime.toFixed(1)}s to cross, crumbles in ${CONFIG.surfaces.crumbling.delay}s`
              );
            }
          }

          if (seg.surfaceType === SurfaceType.Shrinking) {
            const timeToVanish = (1 - 0.1) / CONFIG.surfaces.shrinking.shrinkRate;
            if (crossTime > timeToVanish) {
              failures.push(
                `Seg ${j} [shrinking]: ${crossTime.toFixed(1)}s to cross, vanishes in ${timeToVanish.toFixed(1)}s`
              );
            }
          }

          if (seg.surfaceType === SurfaceType.Invisible && seg.invisible) {
            if (crossTime > seg.invisible.onTime) {
              failures.push(
                `Seg ${j} [invisible]: ${crossTime.toFixed(1)}s to cross, visible for ${seg.invisible.onTime}s`
              );
            }
          }
        }

        expect(failures, failures.join("\n")).toHaveLength(0);
      });

      // RULE 7
      it("speed conveyors with sideways push connect seamlessly", () => {
        const failures: string[] = [];

        for (let j = 0; j < level.paths.length; j++) {
          const seg = level.paths[j];
          if (seg.surfaceType !== SurfaceType.Speed || !seg.direction) continue;
          if (Math.abs(seg.direction[0]) <= 0.1) continue; // only sideways pushers

          const segBox = segmentAABB(seg);
          let closestFrontGap = Infinity;
          let closestBackGap = Infinity;
          let frontIdx = -1;
          let backIdx = -1;

          for (let k = 0; k < level.paths.length; k++) {
            if (k === j) continue;
            const otherBox = segmentAABB(level.paths[k]);
            if (otherBox.maxX < segBox.minX || otherBox.minX > segBox.maxX) continue;

            const backDist = segBox.maxZ - otherBox.minZ;
            if (backDist >= -0.5 && backDist < closestBackGap) {
              const gap = horizontalGap(segBox, otherBox);
              if (gap < closestBackGap) { closestBackGap = gap; backIdx = k; }
            }
            const frontDist = otherBox.maxZ - segBox.minZ;
            if (frontDist >= -0.5 && frontDist < closestFrontGap) {
              const gap = horizontalGap(segBox, otherBox);
              if (gap < closestFrontGap) { closestFrontGap = gap; frontIdx = k; }
            }
          }

          if (closestFrontGap > 0.5 && frontIdx >= 0)
            failures.push(`Seg ${j} [speed] front gap ${closestFrontGap.toFixed(1)}`);
          if (closestBackGap > 0.5 && backIdx >= 0)
            failures.push(`Seg ${j} [speed] back gap ${closestBackGap.toFixed(1)}`);
        }

        expect(failures, `Speed gaps:\n${failures.join("\n")}`).toHaveLength(0);
      });

      // RULE 8
      it("moving platform touches (not overlaps) neighbors at extremes", () => {
        // A moving platform sits in a gap between two static neighbors.
        // At each extreme of its travel, its edge must touch the neighbor
        // (gap ≤ tolerance) but NOT overlap it (gap must be ≥ 0).
        //
        // Layout formula: gap between neighbors = platform_depth + 2*range.
        // Platform center sits midway. At +extreme, front edge = neighbor edge.
        //
        // For Y-axis movers: rest position must touch a neighbor in XZ.
        const failures: string[] = [];

        for (let j = 0; j < level.paths.length; j++) {
          const seg = level.paths[j];
          if (!seg.platformMoving) continue;

          const { axis, range } = seg.platformMoving;
          const movesY = Math.abs(axis[1]) > 0.1;

          if (movesY) {
            const restBox = segmentAABB(seg);
            let touches = false;
            for (let k = 0; k < level.paths.length; k++) {
              if (k === j) continue;
              if (horizontalGap(restBox, segmentAABB(level.paths[k])) <= TOUCH_TOLERANCE &&
                  Math.abs(topY(seg) - topY(level.paths[k])) <= BALL_RADIUS + 0.5) {
                touches = true;
                break;
              }
            }
            if (!touches)
              failures.push(`Seg ${j} [moving Y] rest position doesn't touch any neighbor`);
            continue;
          }

          const [px, py, pz] = seg.position;
          const [, sh] = seg.size;

          // Check each extreme: must touch (not overlap) a neighbor
          for (const sign of [1, -1]) {
            const ePos: [number, number, number] = [
              px + axis[0] * range * sign,
              py + axis[1] * range * sign,
              pz + axis[2] * range * sign,
            ];
            const eBox = segmentAABB({ position: ePos, size: seg.size });

            let minGap = Infinity;
            for (let k = 0; k < level.paths.length; k++) {
              if (k === j) continue;
              if (level.paths[k].platformMoving) continue;
              const otherBox = segmentAABB(level.paths[k]);
              const gap = horizontalGap(eBox, otherBox);
              const eTop = ePos[1] + sh / 2;
              if (Math.abs(eTop - topY(level.paths[k])) <= BALL_RADIUS + 0.5) {
                minGap = Math.min(minGap, gap);
              }
            }

            const dir = sign > 0 ? "+" : "-";
            if (minGap > TOUCH_TOLERANCE) {
              failures.push(
                `Seg ${j} [moving] at ${dir}extreme ` +
                `(${ePos.map(v => v.toFixed(1))}) ` +
                `gap=${minGap === Infinity ? "none" : minGap.toFixed(1)} — doesn't reach neighbor`
              );
            }
          }

          // Movers that travel along Z (or diagonally with Z): at rest, must
          // not overlap any static neighbor in Z (it should sit in the gap).
          // Pure X-movers are exempt — they share the Z-lane with neighbors.
          if (Math.abs(axis[2]) > 0.01) {
            const restBox = segmentAABB(seg);
            for (let k = 0; k < level.paths.length; k++) {
              if (k === j) continue;
              if (level.paths[k].platformMoving) continue;
              const otherBox = segmentAABB(level.paths[k]);
              if (Math.abs(topY(seg) - topY(level.paths[k])) > BALL_RADIUS + 0.5) continue;
              const overlapZ = Math.min(restBox.maxZ, otherBox.maxZ) - Math.max(restBox.minZ, otherBox.minZ);
              if (overlapZ > TOUCH_TOLERANCE) {
                failures.push(
                  `Seg ${j} [moving] at rest overlaps seg ${k} by ${overlapZ.toFixed(1)} in Z`
                );
              }
            }
          }

          // Range must be meaningful
          if (range < 1) {
            failures.push(`Seg ${j} [moving] range=${range} too small (min 1)`);
          }
        }

        expect(failures, `Moving platform issues:\n${failures.join("\n")}`).toHaveLength(0);
      });

      // RULE 9
      it("Z-axis moving platforms have pause for boarding", () => {
        const failures: string[] = [];

        for (let j = 0; j < level.paths.length; j++) {
          const seg = level.paths[j];
          if (!seg.platformMoving) continue;
          if (Math.abs(seg.platformMoving.axis[2]) <= 0.1) continue;

          const pause = seg.platformMoving.pause ?? 0;
          if (pause < 0.5) {
            failures.push(`Seg ${j} [moving Z] pause=${pause}s, needs ≥0.5s`);
          }
        }

        expect(failures, failures.join("\n")).toHaveLength(0);
      });

      // RULE 10
      it("teleport pads are placed on platforms", () => {
        if (!level.teleportPairs) return;

        const segments = getWalkableSegments(level);
        const failures: string[] = [];

        for (let p = 0; p < level.teleportPairs.length; p++) {
          const pair = level.teleportPairs[p];
          for (const [label, pos] of [["A", pair.a], ["B", pair.b]] as const) {
            const idx = findSegmentAt(pos[0], pos[2], segments);
            if (idx < 0) {
              failures.push(
                `Pair ${p} pad ${label} at (${pos.join(",")}) is not on any platform`
              );
            }
          }
        }

        expect(failures, failures.join("\n")).toHaveLength(0);
      });

      // RULE 11
      it("teleport pad pairs are far apart", () => {
        if (!level.teleportPairs) return;

        const failures: string[] = [];
        for (let p = 0; p < level.teleportPairs.length; p++) {
          const pair = level.teleportPairs[p];
          const r = pair.radius ?? 1.5;
          const dx = pair.a[0] - pair.b[0];
          const dz = pair.a[2] - pair.b[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          const minDist = r * 4;
          if (dist < minDist) {
            failures.push(
              `Pair ${p}: pads are ${dist.toFixed(1)} apart, need ≥${minDist.toFixed(1)} (4× radius ${r})`
            );
          }
        }

        expect(failures, failures.join("\n")).toHaveLength(0);
      });

      // RULE 12
      it("platform widths are not wildly different", () => {
        // Within a level, the widest platform should be no more than 4×
        // the narrowest. This keeps the visual look uniform.
        // Bridges and moving platforms are exempt.
        const widths: number[] = [];
        for (const seg of level.paths) {
          if (seg.isBridge || seg.platformMoving) continue;
          widths.push(seg.size[0]);
        }
        if (widths.length < 2) return;

        const minW = Math.min(...widths);
        const maxW = Math.max(...widths);
        expect(
          maxW / minW,
          `widths range from ${minW} to ${maxW} (ratio ${(maxW / minW).toFixed(1)}×, max 4×)`
        ).toBeLessThanOrEqual(4);
      });
    });
  });
});
