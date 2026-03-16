import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 26 — Shrinking Ground",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -50],
    size: [W, 3, 4],
  },
  paths: [
    // Start platform
    { position: [0, 0, 0], size: [W, H, 8], noWalls: true },
    // Shrinking platform — rush across
    { position: [0, 0, -10], size: [8, H, 8], noWalls: true,
      surfaceType: SurfaceType.Shrinking },
    // Safe island
    { position: [0, 0, -20], size: [W, H, 6], noWalls: true },
    // Longer shrinking platform
    { position: [0, 0, -30], size: [10, H, 8], noWalls: true,
      surfaceType: SurfaceType.Shrinking },
    // Safe island
    { position: [0, 0, -40], size: [W, H, 6], noWalls: true },
    // Finish platform
    { position: [0, 0, -50], size: [W, H, 8], noWalls: true },
  ],
};

export default level;
