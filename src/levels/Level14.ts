import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

export const LEVEL_14: LevelData = {
  name: "Level 14 — Conveyor Chaos",
  startPosition: [0, 2, 0],
  finishZone: { position: [0, 1.5, -128], size: [W, 3, 4] },
  paths: [
    // Start platform
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // Speed strip pushing right
    { position: [0, 0, -12], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [1, 0, 0] },
    // Normal breather
    { position: [0, 0, -25], size: [W, H, 8], noWalls: true },
    // Speed strip pushing left
    { position: [0, 0, -36], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] },
    // Normal checkpoint
    { position: [0, 0, -49], size: [W, H, 8], noWalls: true },
    // Speed strip pushing forward (fast)
    { position: [0, 0, -60], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, -1] },
    // Normal recovery
    { position: [0, 0, -73], size: [W, H, 8], noWalls: true },
    // Narrow speed strip pushing right
    { position: [0, 0, -84], size: [4, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [1, 0, 0] },
    // Normal platform
    { position: [0, 0, -97], size: [W, H, 8], noWalls: true },
    // Speed strip pushing backward (fight it!)
    { position: [0, 0, -108], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, 1] },
    // Final stretch
    { position: [0, 0, -121], size: [W, H, 12], noWalls: true },
    // Finish platform
    { position: [0, 0, -130], size: [W, H, 6], noWalls: true },
  ],
  latticeWalls: [
    { position: [0, 0.25, -15], width: W, height: 2.5, gapSide: "left", gapWidth: 2 },
    { position: [0, 0.25, -39], width: W, height: 2.5, gapSide: "right", gapWidth: 2 },
    { position: [0, 0.25, -63], width: W, height: 2.5, gapSide: "center", gapWidth: 1.8 },
    { position: [0, 0.25, -87], width: 4, height: 2.5, gapSide: "left", gapWidth: 1.5 },
  ],
  obstacles: [
    { position: [1.5, 0.75, -10], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -28], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 1.5 } },
    { position: [-1.5, 0.75, -34], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -58], size: [1, 1, 1], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 2 } },
    { position: [0, 0.75, -75], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [1, 0.75, -100], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [-1, 0.75, -105], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
};
