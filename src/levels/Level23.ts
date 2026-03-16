import type { LevelData } from "./Level";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

// Moving platform design: at max extent, edges must touch the static neighbor.
// Platform half-depth + range = distance from platform center to neighbor edge.

const level: LevelData = {
  name: "Level 23 — Moving Platforms",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -52],
    size: [W, 3, 4],
  },
  paths: [
    // Start: z=-2 to z=6
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },

    // Moving L/R: center z=-5, depth 6 → z=-8 to z=-2.
    // Touches start at z=-2 ✓ and island at z=-8 ✓
    // Range 3 on X, so sweeps x=-3..+3.
    { position: [0, 0, -5], size: [5, H, 6], noWalls: true,
      platformMoving: { axis: [1, 0, 0], range: 3, speed: 1.5 } },

    // Island: z=-8 to z=-14
    { position: [0, 0, -11], size: [W, H, 6], noWalls: true },

    // Moving fwd/back: center z=-19, depth 4 → z=-21 to z=-17.
    // Range 3, so z sweeps -24..-14. At z=-14: touches island edge at z=-14. ✓
    // At z=-24: touches next island edge at z=-24. ✓
    // Pause 1.5s for boarding.
    { position: [0, 0, -19], size: [5, H, 4], noWalls: true,
      platformMoving: { axis: [0, 0, 1], range: 3, speed: 1.5, pause: 1.5 } },

    // Island: z=-24 to z=-30
    { position: [0, 0, -27], size: [W, H, 6], noWalls: true },

    // Moving up/down: center z=-34, depth 4 → z=-36 to z=-32. Touches island at z=-30.
    // Y range 2, pauses at top/bottom.
    { position: [0, 0, -34], size: [5, H, 4], noWalls: true,
      platformMoving: { axis: [0, 1, 0], range: 2, speed: 1, pause: 1 } },

    // Island: z=-36 to z=-42
    { position: [0, 0, -39], size: [W, H, 6], noWalls: true },

    // Moving diagonal (X+Z) with pause: center z=-46, depth 4 → z=-48 to z=-44.
    // Range 2 on both X and Z. At +extreme: z=-44 touches island z=-42. ✓
    // At -extreme: z=-50 touches finish z=-49. ✓
    { position: [0, 0, -46], size: [5, H, 4], noWalls: true,
      platformMoving: { axis: [1, 0, 1], range: 2, speed: 1.5, pause: 1 } },

    // Finish: z=-49 to z=-55
    { position: [0, 0, -52], size: [W, H, 6], noWalls: true },
  ],
};

export default level;
