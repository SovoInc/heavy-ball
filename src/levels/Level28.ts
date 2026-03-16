import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 28 — Now You See Me",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -50],
    size: [W, 3, 4],
  },
  paths: [
    // Start platform
    { position: [0, 0, 0], size: [W, H, 8], noWalls: true },
    // First invisible platform — generous timing
    { position: [0, 0, -10], size: [W, H, 8], noWalls: true,
      surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } },
    // Safe island
    { position: [0, 0, -20], size: [W, H, 6], noWalls: true },
    // Faster cycle — must time it
    { position: [0, 0, -29], size: [W, H, 6], noWalls: true,
      surfaceType: SurfaceType.Invisible, invisible: { onTime: 2, offTime: 2 } },
    // Safe island
    { position: [0, 0, -37], size: [W, H, 4], noWalls: true },
    // Short visible window
    { position: [0, 0, -43], size: [W, H, 4], noWalls: true,
      surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 2 } },
    // Finish
    { position: [0, 0, -50], size: [W, H, 8], noWalls: true },
  ],
};

export default level;
