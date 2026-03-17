import type { LevelData } from "./Level";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

// Level creation rule: each platform's back edge (maxZ) must equal
// the next platform's front edge (minZ). For a platform at center z
// with depth d: minZ = z - d/2, maxZ = z + d/2.
//
// Tilted platform edge heights: center_y ± sin(tilt) * depth/2

const level: LevelData = {
  name: "Level 22 — Tilted",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, -1.7, -52],
    size: [W, 4, 4],
  },
  paths: [
    // Flat start: z=-2 to z=6
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },
    // Gentle downhill: z=-18 to z=-2, tilt 0.08
    // back edge y: -0.64 + sin(0.08)*8 = -0.64+0.64 = 0 ✓
    // front edge y: -0.64 - 0.64 = -1.28
    { position: [0, -0.64, -10], size: [W, H, 16], noWalls: true, tilt: 0.08 },
    // Flat landing: z=-24 to z=-18
    { position: [0, -1.28, -21], size: [W, H, 6], noWalls: true },
    // Steeper slope: z=-40 to z=-24, tilt 0.12
    // back edge y: -2.24 + sin(0.12)*8 = -2.24+0.96 = -1.28 ✓
    // front edge y: -2.24 - 0.96 = -3.2
    { position: [0, -2.24, -32], size: [W, H, 16], noWalls: true, tilt: 0.12 },
    // Flat section: z=-48 to z=-40
    { position: [0, -3.2, -44], size: [W, H, 8], noWalls: true },
    // Finish: z=-56 to z=-48
    { position: [0, -3.2, -52], size: [W, H, 8], noWalls: true },
  ],
};

export default level;
