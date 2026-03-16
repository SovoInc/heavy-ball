import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 27 — Black Hole",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -50],
    size: [W, 3, 4],
  },
  paths: [
    // Start platform
    { position: [0, 0, 0], size: [W, H, 8], noWalls: true },
    // Approach to magnet
    { position: [0, 0, -8], size: [W, H, 6], noWalls: true },
    // Magnet platform — pulls ball to center, hard to cross
    { position: [0, 0, -18], size: [10, H, 8], noWalls: true,
      surfaceType: SurfaceType.Magnet },
    // Recovery area
    { position: [0, 0, -28], size: [W, H, 6], noWalls: true },
    // Another magnet — offset so you have to fight the pull
    { position: [3, 0, -38], size: [10, H, 8], noWalls: true,
      surfaceType: SurfaceType.Magnet },
    // Final approach
    { position: [0, 0, -46], size: [W, H, 6], noWalls: true },
    // Finish
    { position: [0, 0, -52], size: [W, H, 6], noWalls: true },
  ],
};

export default level;
