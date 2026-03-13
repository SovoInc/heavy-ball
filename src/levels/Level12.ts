import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

export const LEVEL_12: LevelData = {
  name: "Level 12 — Hot Foot",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -110],
    size: [W, 3, 4],
  },
  paths: [
    // Start island (z 0 to -10)
    { position: [0, 0, -5], size: [W, H, 10], noWalls: true },
    // Lava crossing 1 (z -10 to -15) — short, introductory
    { position: [0, 0, -12.5], size: [W, H, 5], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe island 2 (z -15 to -25)
    { position: [0, 0, -20], size: [W, H, 10], noWalls: true },
    // Lava crossing 2 (z -25 to -31) — slightly longer
    { position: [0, 0, -28], size: [W, H, 6], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe island 3 (z -31 to -40)
    { position: [0, 0, -35.5], size: [W, H, 9], noWalls: true },
    // Lava crossing 3 (z -40 to -46)
    { position: [0, 0, -43], size: [W, H, 6], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe island 4 with turn (z -46 to -52)
    { position: [0, 0, -49], size: [W, H, 6], noWalls: true },
    // Turn right
    { position: [3, 0, -52], size: [W + 6, H, W], noWalls: true },
    // Safe corridor (z -55 to -62)
    { position: [6, 0, -58.5], size: [W, H, 7], noWalls: true },
    // Lava crossing 4 (z -62 to -67)
    { position: [6, 0, -64.5], size: [W, H, 5], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe island 5 (z -67 to -75)
    { position: [6, 0, -71], size: [W, H, 8], noWalls: true },
    // Lava crossing 5 (z -75 to -81) — longer, tense
    { position: [6, 0, -78], size: [W, H, 6], noWalls: true, surfaceType: SurfaceType.Lava },
    // Safe island 6 with turn (z -81 to -87)
    { position: [6, 0, -84], size: [W, H, 6], noWalls: true },
    // Turn left
    { position: [3, 0, -87], size: [W + 6, H, W], noWalls: true },
    // Lava crossing 6 (z -90 to -95)
    { position: [0, 0, -92.5], size: [W, H, 5], noWalls: true, surfaceType: SurfaceType.Lava },
    // Final safe island to finish (z -95 to -108)
    { position: [0, 0, -101.5], size: [W, H, 13], noWalls: true },
  ],
  obstacles: [
    // TimeBonus on start island
    {
      position: [0, 0.75, -7],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle on safe island 2
    {
      position: [0, 0.75, -20],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // Stationary obstacle on safe island 3
    {
      position: [1.5, 0.75, -36],
      size: [1, 1, 0.8],
      breakable: true,
    },
    // TimeBonus on safe island 4
    {
      position: [0, 0.75, -49],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle on safe corridor
    {
      position: [6, 0.75, -58],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3 },
    },
    // Moving obstacle on safe island 5
    {
      position: [6, 0.75, -72],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3.5 },
    },
    // TimeBonus on safe island 6
    {
      position: [6, 0.75, -84],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -22],
      width: W,
      height: 2,
      gapSide: "center",
      gapWidth: 2,
    },
    {
      position: [6, 0.25, -69],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 1.8,
    },
  ],
};
