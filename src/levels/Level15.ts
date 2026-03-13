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
  finishZone: { position: [0, 1.5, -118], size: [W, 3, 4] },
  paths: [
    // Safe start
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // First crumble section (short intro)
    { position: [0, 0, -11], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 1
    { position: [0, 0, -22], size: [W, H, 6], noWalls: true },
    // Narrow crumbling bridge
    { position: [0, 0, -32], size: [N, H, 14], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 2
    { position: [0, 0, -44], size: [W, H, 6], noWalls: true },
    // Long crumbling run
    { position: [0, 0, -55], size: [W, H, 16], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 3
    { position: [0, 0, -68], size: [W, H, 6], noWalls: true },
    // Crumbling with gaps
    { position: [0, 0, -76], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Tiny safe island
    { position: [0, 0, -83], size: [3, H, 4], noWalls: true },
    // More crumbling
    { position: [0, 0, -90], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Safe checkpoint 4
    { position: [0, 0, -100], size: [W, H, 6], noWalls: true },
    // Final narrow crumbling gauntlet
    { position: [0, 0, -109], size: [N, H, 12], noWalls: true, surfaceType: SurfaceType.Crumbling },
    // Finish platform
    { position: [0, 0, -120], size: [W, H, 8], noWalls: true },
  ],
  obstacles: [
    { position: [0, 0.75, -10], size: [1, 1, 1], color: 0x887766, breakable: true },
    { position: [0, 0.75, -42], size: [0.8, 1, 0.8], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
    { position: [1.5, 0.75, -52], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [-1.5, 0.75, -58], size: [0.8, 1, 0.8], color: 0x887766, breakable: true },
    { position: [0, 0.75, -66], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
    { position: [0, 0.75, -98], size: [1, 1, 1], color: 0x887766, breakable: true, powerUp: PowerUpType.Shield },
  ],
};
