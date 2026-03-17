import type { LevelData } from "./Level";
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
    // Island 1: x=0 (z=-2 to z=6)
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },
    // Portal approach (z=-2 to z=-10)
    { position: [0, 0, -6], size: [W, H, 8], noWalls: true },
    // Island 2: x=20 (z=-4 to z=4) — portal 1 destination
    { position: [20, 0, 0], size: [W, H, 8], noWalls: true },
    // Path continues (z=-4 to z=-12)
    { position: [20, 0, -8], size: [W, H, 8], noWalls: true },
    // More path (z=-12 to z=-20)
    { position: [20, 0, -16], size: [W, H, 8], noWalls: true },
    // Island 3: x=20 (z=-20 to z=-28) — portal 2 destination
    { position: [20, 0, -24], size: [W, H, 8], noWalls: true },
    // Finish (z=-28 to z=-34)
    { position: [20, 0, -31], size: [W, H, 6], noWalls: true },
  ],
  teleportPairs: [
    // Portal 1: end of island 1 → start of island 2 (20 units apart)
    { a: [0, 0.25, -8], b: [20, 0.25, 2] },
    // Portal 2: end of island 2 path → start of island 3 (8 units apart)
    { a: [20, 0.25, -14], b: [20, 0.25, -22] },
  ],
};

export default level;
