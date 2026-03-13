import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

export const LEVEL_16: LevelData = {
  name: "Level 16 — Ice and Fire",
  startPosition: [0, 2, 0],
  finishZone: { position: [0, 1.5, -128], size: [W, 3, 4] },
  paths: [
    // Safe start
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // Ice section 1
    { position: [0, 0, -12], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Ice },
    // Narrow normal divider
    { position: [0, 0, -21.5], size: [N, H, 5], noWalls: true },
    // Lava section 1
    { position: [0, 0, -30], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe checkpoint 1
    { position: [0, 0, -40], size: [W, H, 8], noWalls: true },
    // Narrow ice section 2 (with wind)
    { position: [0, 0, -51], size: [N, H, 14], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal divider
    { position: [0, 0, -60.5], size: [N, H, 5], noWalls: true },
    // Lava section 2
    { position: [0, 0, -69], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe checkpoint 2
    { position: [0, 0, -79], size: [W, H, 8], noWalls: true },
    // Wide ice section 3 (wind + obstacles)
    { position: [0, 0, -90], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal divider
    { position: [0, 0, -99.5], size: [N, H, 5], noWalls: true },
    // Narrow lava section 3
    { position: [0, 0, -107], size: [4, H, 10], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe checkpoint 3
    { position: [0, 0, -116], size: [W, H, 8], noWalls: true },
    // Finish platform
    { position: [0, 0, -125], size: [W, H, 10], noWalls: true },
  ],
  windZones: [
    // Crosswind on first ice section
    { position: [0, 1, -12], size: [W + 2, 3, 14], direction: [1, 0, 0], strength: 3 },
    // Strong crosswind on narrow ice
    { position: [0, 1, -51], size: [N + 2, 3, 14], direction: [-1, 0, 0], strength: 4 },
    // Wind on wide ice section 3
    { position: [0, 1, -90], size: [W + 2, 3, 14], direction: [1, 0, 0], strength: 3.5 },
  ],
  obstacles: [
    { position: [1.5, 0.75, -10], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -28], size: [1, 1, 1], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 1.5 } },
    { position: [0, 0.75, -38], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
    { position: [0, 0.75, -67], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 2 } },
    { position: [0, 0.75, -77], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [-1.5, 0.75, -87], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [1.5, 0.75, -93], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -114], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
  ],
};
