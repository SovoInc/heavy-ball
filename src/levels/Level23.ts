import type { LevelData } from "./Level";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

// Moving platform layout rule:
// The gap between two static neighbors = platform_depth + 2 * range.
// This way the platform sits centered in the gap at rest, and at each
// extreme its edge just touches (not overlaps) the neighbor.
//
// Example: depth=6, range=3 → gap=12. Platform center is 6 from each neighbor edge.
// At +extreme: center+3, front edge = center+3+3 = neighbor edge. ✓
// At -extreme: center-3, back edge = center-3-3 = other neighbor edge. ✓

const level: LevelData = {
  name: "Level 23 — Moving Platforms",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -62],
    size: [W, 3, 4],
  },
  paths: [
    // 0: Start: z=-2 to z=6
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },

    // 1: Moving L/R: depth=6, moves on X only (no Z travel).
    // Just needs to span the Z gap between start and next island.
    // Sits z=-8 to z=-2, touching start at z=-2 and island at z=-8.
    { position: [0, 0, -5], size: [5, H, 6], noWalls: true,
      platformMoving: { axis: [1, 0, 0], range: 3, speed: 1.5 } },

    // 2: Island: z=-14 to z=-8
    { position: [0, 0, -11], size: [W, H, 6], noWalls: true },

    // 3: Moving fwd/back: depth=6, range=3 on Z.
    // gap = 6 + 2*3 = 12. Island ends z=-14, next island starts z=-26.
    // Center = -14 - 6 = -20. Spans z=-23 to z=-17 at rest.
    // +extreme z=-17: spans z=-20 to z=-14 → touches island at z=-14. ✓
    // -extreme z=-23: spans z=-26 to z=-20 → touches island at z=-26. ✓
    { position: [0, 0, -20], size: [5, H, 6], noWalls: true,
      platformMoving: { axis: [0, 0, 1], range: 3, speed: 1.5, pause: 1.5 } },

    // 4: Island: z=-32 to z=-26
    { position: [0, 0, -29], size: [W, H, 6], noWalls: true },

    // 5: Moving up/down: depth=6, Y-axis. Just touches neighbors in Z.
    // z=-38 to z=-32, touching island.
    { position: [0, 0, -35], size: [5, H, 6], noWalls: true,
      platformMoving: { axis: [0, 1, 0], range: 2, speed: 1, pause: 1 } },

    // 6: Island: z=-44 to z=-38
    { position: [0, 0, -41], size: [W, H, 6], noWalls: true },

    // 7: Moving diagonal: depth=6, range=3 on [1,0,1].
    // Z-component of travel = range = 3.
    // gap in Z = 6 + 2*3 = 12. Island ends z=-44, finish starts z=-56.
    // Center z = -44 - 6 = -50. Spans z=-53 to z=-47 at rest.
    // +extreme z=-47: spans z=-50 to z=-44 → touches island at z=-44. ✓
    // -extreme z=-53: spans z=-56 to z=-50 → touches finish at z=-56. ✓
    { position: [0, 0, -50], size: [5, H, 6], noWalls: true,
      platformMoving: { axis: [1, 0, 1], range: 3, speed: 1.5, pause: 1 } },

    // 8: Finish: z=-62 to z=-56
    { position: [0, 0, -59], size: [W, H, 6], noWalls: true },
  ],
};

export default level;
