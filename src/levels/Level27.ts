import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 27 — Black Hole",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -40],
    size: [W, 3, 4],
  },
  paths: [
    // Start: z=-2 to z=6
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },
    // Approach: z=-8 to z=-2
    { position: [0, 0, -5], size: [W, H, 6], noWalls: true },
    // Magnet: z=-16 to z=-8
    { position: [0, 0, -12], size: [W, H, 8], noWalls: true,
      surfaceType: SurfaceType.Magnet },
    // Recovery: z=-22 to z=-16
    { position: [0, 0, -19], size: [W, H, 6], noWalls: true },
    // Offset magnet: z=-30 to z=-22
    { position: [3, 0, -26], size: [W, H, 8], noWalls: true,
      surfaceType: SurfaceType.Magnet },
    // Final: z=-36 to z=-30
    { position: [0, 0, -33], size: [W, H, 6], noWalls: true },
    // Finish: z=-42 to z=-36
    { position: [0, 0, -39], size: [W, H, 6], noWalls: true },
  ],
};

export default level;
