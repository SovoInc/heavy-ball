import type { LevelData } from "./Level";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 24 — Spinning Tops",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -46],
    size: [W, 3, 4],
  },
  paths: [
    // Start platform
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },
    // Slow rotating platform (overlaps neighbors)
    { position: [0, 0, -7], size: [8, H, 8], noWalls: true,
      platformRotating: { speed: 0.5 } },
    // Static connector
    { position: [0, 0, -16], size: [W, H, 8], noWalls: true },
    // Faster rotating platform
    { position: [0, 0, -27], size: [8, H, 8], noWalls: true,
      platformRotating: { speed: -1.0 } },
    // Static connector
    { position: [0, 0, -36], size: [W, H, 8], noWalls: true },
    // Finish platform
    { position: [0, 0, -46], size: [W, H, 8], noWalls: true },
  ],
};

export default level;
