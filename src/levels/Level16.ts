import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 16 — Ice and Fire",
  startPosition: [0, 2, 0],
  finishZone: { position: [0, 1.5, -114], size: [W, 3, 4] },
  paths: [
    // Safe start (z 5 to -5)
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // Ice section 1 (z -5 to -19)
    { position: [0, 0, -12], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Ice },
    // Narrow normal divider (z -19 to -24)
    { position: [0, 0, -21.5], size: [N, H, 5], noWalls: true },
    // Lava section 1 (z -24 to -31)
    { position: [0, 0, -27.5], size: [W, H, 7], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe checkpoint 1 (z -31 to -39)
    { position: [0, 0, -35], size: [W, H, 8], noWalls: true },
    // Narrow ice section 2 with wind (z -39 to -53)
    { position: [0, 0, -46], size: [N, H, 14], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal divider (z -53 to -58)
    { position: [0, 0, -55.5], size: [N, H, 5], noWalls: true },
    // Lava section 2 (z -58 to -65)
    { position: [0, 0, -61.5], size: [W, H, 7], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe checkpoint 2 (z -65 to -73)
    { position: [0, 0, -69], size: [W, H, 8], noWalls: true },
    // Wide ice section 3 with wind (z -73 to -87)
    { position: [0, 0, -80], size: [W, H, 14], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal divider (z -87 to -92)
    { position: [0, 0, -89.5], size: [N, H, 5], noWalls: true },
    // Narrow lava section 3 (z -92 to -99)
    { position: [0, 0, -95.5], size: [4, H, 7], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe checkpoint 3 (z -99 to -107)
    { position: [0, 0, -103], size: [W, H, 8], noWalls: true },
    // Finish platform (z -107 to -117)
    { position: [0, 0, -112], size: [W, H, 10], noWalls: true },
  ],
  windZones: [
    // Crosswind on first ice section
    { position: [0, 1, -12], size: [W + 2, 3, 14], direction: [1, 0, 0], strength: 3 },
    // Strong crosswind on narrow ice
    { position: [0, 1, -46], size: [N + 2, 3, 14], direction: [-1, 0, 0], strength: 4 },
    // Wind on wide ice section 3
    { position: [0, 1, -80], size: [W + 2, 3, 14], direction: [1, 0, 0], strength: 3.5 },
  ],
  obstacles: [
    { position: [1.5, 0.75, -10], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -27], size: [1, 1, 1], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 1.5 } },
    { position: [0, 0.75, -33], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
    { position: [0, 0.75, -61], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, moving: { axis: "x", range: 2, speed: 2 } },
    { position: [0, 0.75, -67], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [-1.5, 0.75, -77], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [1.5, 0.75, -83], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -101], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
  ],
};

export default level;
