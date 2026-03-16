import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

export const LEVEL_14: LevelData = {
  name: "Level 14 — Conveyor Chaos",
  startPosition: [0, 2, 0],
  finishZone: { position: [0, 1.5, -122], size: [W, 3, 4] },
  paths: [
    // Platform edges:  0:[−5,5]  1:[−19,−5]  2:[−27,−19]  3:[−41,−27]
    //   4:[−49,−41]  5:[−63,−49]  6:[−71,−63]  7:[−85,−71]
    //   8:[−93,−85]  9:[−107,−93]  10:[−119,−107]  11:[−125,−119]
    // Start platform
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // Speed strip pushing right
    { position: [0, 0, -12], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [1, 0, 0] },
    // Normal breather
    { position: [0, 0, -23], size: [W, H, 8], noWalls: true },
    // Speed strip pushing left
    { position: [0, 0, -34], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] },
    // Normal checkpoint
    { position: [0, 0, -45], size: [W, H, 8], noWalls: true },
    // Speed strip pushing forward (fast)
    { position: [0, 0, -56], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, -1] },
    // Normal recovery
    { position: [0, 0, -67], size: [W, H, 8], noWalls: true },
    // Narrow speed strip pushing right
    { position: [0, 0, -78], size: [4, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [1, 0, 0] },
    // Normal platform
    { position: [0, 0, -89], size: [W, H, 8], noWalls: true },
    // Speed strip pushing backward (fight it!)
    { position: [0, 0, -100], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, 1] },
    // Final stretch
    { position: [0, 0, -113], size: [W, H, 12], noWalls: true },
    // Finish platform
    { position: [0, 0, -122], size: [W, H, 6], noWalls: true },
  ],
  latticeWalls: [
    { position: [0, 0.25, -15], width: W, height: 2.5, gapSide: "left", gapWidth: 2 },
    { position: [0, 0.25, -37], width: W, height: 2.5, gapSide: "right", gapWidth: 2 },
    { position: [0, 0.25, -59], width: W, height: 2.5, gapSide: "center", gapWidth: 1.8 },
    { position: [0, 0.25, -81], width: 4, height: 2.5, gapSide: "left", gapWidth: 1.5 },
  ],
  obstacles: [
    { position: [1.5, 0.75, -10], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -25], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 1.5 } },
    { position: [-1.5, 0.75, -31], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -54], size: [1, 1, 1], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 2 } },
    { position: [0, 0.75, -69], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [1, 0.75, -92], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [-1, 0.75, -97], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
};
