import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

export const LEVEL_15: LevelData = {
  name: "Level 15 — Crumbling Ruins",
  startPosition: [0, 2, 0],
  finishZone: { position: [0, 1.5, -108], size: [W, 3, 4] },
  paths: [
    // Safe start
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // First crumble section (z -5 to -17)
    { position: [0, 0, -11], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 1 (z -17 to -23, overlaps crumble end)
    { position: [0, 0, -20], size: [W, H, 6], noWalls: true },
    // Narrow crumbling bridge (z -23 to -37)
    { position: [0, 0, -30], size: [N, H, 14], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 2 (z -37 to -43, overlaps crumble end)
    { position: [0, 0, -40], size: [W, H, 6], noWalls: true },
    // Long crumbling run (z -43 to -55)
    { position: [0, 0, -49], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 3 (z -55 to -61, overlaps crumble end)
    { position: [0, 0, -58], size: [W, H, 6], noWalls: true },
    // Crumbling with gaps (z -61 to -71)
    { position: [0, 0, -66], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Tiny safe island (z -71 to -75, overlaps crumble end)
    { position: [0, 0, -73], size: [3, H, 4], noWalls: true },
    // More crumbling (z -75 to -85)
    { position: [0, 0, -80], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 4 (z -85 to -91, overlaps crumble end)
    { position: [0, 0, -88], size: [W, H, 6], noWalls: true },
    // Final narrow crumbling gauntlet (z -91 to -103)
    { position: [0, 0, -97], size: [N, H, 12], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Finish platform (z -103 to -111, overlaps crumble end)
    { position: [0, 0, -107], size: [W, H, 8], noWalls: true },
  ],
  obstacles: [
    { position: [0, 0.75, -10], size: [1, 1, 1], color: 0x887766, breakable: true },
    { position: [0, 0.75, -38], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
    { position: [1.5, 0.75, -46], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [-1.5, 0.75, -50], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -56], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
    { position: [0, 0.75, -86], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
  ],
};
