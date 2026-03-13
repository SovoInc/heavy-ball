import type { LevelData } from "./Level";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

export const LEVEL_6: LevelData = {
  name: "Level 6 — Windswept",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [6, 1.5, -128],
    size: [W, 3, 4],
  },
  paths: [
    // start area: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // first corridor (wind zone 1): z -5 to -35
    { position: [0, 0, -20], size: [W + 2, H, 30], noWalls: true },
    // turn right
    { position: [3, 0, -35], size: [W + 6, H, W], noWalls: true },
    // right corridor: z -38 to -55
    { position: [6, 0, -46.5], size: [W + 2, H, 17], noWalls: true },
    // wide platform (wind zone 2): z -55 to -80
    { position: [6, 0, -67.5], size: [W + 2, H, 25], noWalls: true },
    // turn left
    { position: [3, 0, -80], size: [W + 6, H, W], noWalls: true },
    // left corridor (wind zone 3): z -83 to -108
    { position: [0, 0, -95.5], size: [W + 2, H, 25], noWalls: true },
    // turn right
    { position: [3, 0, -108], size: [W + 6, H, W], noWalls: true },
    // final stretch: z -111 to -132
    { position: [6, 0, -121.5], size: [W, H, 21], noWalls: true },
  ],
  windZones: [
    // First wind zone: pushes right
    {
      position: [0, 1, -20],
      size: [W + 2, 3, 28],
      direction: [1, 0, 0],
      strength: 4,
    },
    // Second wind zone: pushes left
    {
      position: [6, 1, -67.5],
      size: [W + 2, 3, 23],
      direction: [-1, 0, 0],
      strength: 5,
    },
    // Third wind zone: pushes right
    {
      position: [0, 1, -95.5],
      size: [W + 2, 3, 23],
      direction: [1, 0, 0],
      strength: 5.5,
    },
  ],
  obstacles: [
    // Shield before first wind zone
    {
      position: [0, 0.75, -7],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Stationary in first wind corridor
    {
      position: [1.5, 0.75, -25],
      size: [1, 1.2, 0.8],
      breakable: true,
    },
    // Shield before second wind zone
    {
      position: [6, 0.75, -57],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving obstacle in second wind zone
    {
      position: [6, 0.75, -70],
      size: [1.2, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 1.5 },
    },
    // Shield before third wind zone
    {
      position: [0, 0.75, -85],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Stationary in third wind corridor
    {
      position: [-1, 0.75, -100],
      size: [1, 1, 1],
      breakable: true,
    },
    // TimeBonus in final stretch
    {
      position: [6, 0.75, -125],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -15],
      width: W + 2,
      height: 2,
      gapSide: "left",
      gapWidth: 2,
    },
    {
      position: [6, 0.25, -62],
      width: W + 2,
      height: 2.5,
      gapSide: "right",
      gapWidth: 2,
    },
  ],
};
