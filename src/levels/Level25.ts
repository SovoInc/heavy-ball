import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 25 — Warp Zone",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [20, 1.5, -30],
    size: [W, 3, 4],
  },
  paths: [
    // Start platform
    { position: [0, 0, 0], size: [W, H, 8], noWalls: true },
    // Teleport pad 1 — sends to second area
    { position: [0, 0, -8], size: [3, H, 3], noWalls: true,
      surfaceType: SurfaceType.Teleport, teleportTarget: [20, 0, 0] },
    // Second area start (teleport destination)
    { position: [20, 0, 0], size: [W, H, 8], noWalls: true },
    // Path continues
    { position: [20, 0, -10], size: [W, H, 12], noWalls: true },
    // Teleport pad 2 — sends to third area
    { position: [20, 0, -20], size: [3, H, 3], noWalls: true,
      surfaceType: SurfaceType.Teleport, teleportTarget: [20, 0, -26] },
    // Third area
    { position: [20, 0, -26], size: [W, H, 6], noWalls: true },
    // Finish
    { position: [20, 0, -33], size: [W, H, 8], noWalls: true },
  ],
};

export default level;
