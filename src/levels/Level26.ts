import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 26 — Shrinking Ground",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -38],
    size: [W, 3, 4],
  },
  paths: [
    // Start: z=-2 to z=6
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },
    // Shrinking: z=-10 to z=-2
    { position: [0, 0, -6], size: [W, H, 8], noWalls: true,
      surfaceType: SurfaceType.Shrinking },
    // Safe: z=-16 to z=-10
    { position: [0, 0, -13], size: [W, H, 6], noWalls: true },
    // Longer shrinking: z=-24 to z=-16
    { position: [0, 0, -20], size: [W, H, 8], noWalls: true,
      surfaceType: SurfaceType.Shrinking },
    // Safe: z=-30 to z=-24
    { position: [0, 0, -27], size: [W, H, 6], noWalls: true },
    // Finish: z=-36 to z=-30
    { position: [0, 0, -33], size: [W, H, 6], noWalls: true },
  ],
};

export default level;
