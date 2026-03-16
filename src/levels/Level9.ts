import type { LevelData } from "./Level";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 9 — Sky Bridge",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [6, 1.5, -138],
    size: [W, 3, 4],
  },
  paths: [
    // start area: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // approach first bridge: z -5 to -12
    { position: [0, 0, -8.5], size: [3, H, 7], noWalls: true },
    // landing after first bridge: z -22 to -28
    { position: [0, 0, -25], size: [W, H, 6], noWalls: true },
    // approach second bridge: z -28 to -32
    { position: [0, 0, -30], size: [3, H, 4], noWalls: true },
    // landing after second bridge: z -42 to -50
    { position: [0, 0, -46], size: [W, H, 8], noWalls: true },
    // turn right
    { position: [3, 0, -50], size: [W + 6, H, W], noWalls: true },
    // approach third bridge: z -53 to -57
    { position: [6, 0, -55], size: [3, H, 4], noWalls: true },
    // landing after third bridge: z -69 to -78
    { position: [6, 0, -73.5], size: [W, H, 9], noWalls: true },
    // approach fourth bridge: z -78 to -82
    { position: [6, 0, -80], size: [3, H, 4], noWalls: true },
    // landing after fourth bridge: z -96 to -105
    { position: [6, 0, -100.5], size: [W, H, 9], noWalls: true },
    // approach fifth bridge: z -105 to -108
    { position: [6, 0, -106.5], size: [3, H, 3], noWalls: true },
    // landing and final stretch: z -120 to -142
    { position: [6, 0, -131], size: [W, H, 22], noWalls: true },
  ],
  bridges: [
    // Bridge 1: short warm-up
    {
      position: [0, 0, -17],
      width: N,
      length: 10,
    },
    // Bridge 2: longer
    {
      position: [0, 0, -37],
      width: 1.8,
      length: 10,
    },
    // Bridge 3: long and narrow
    {
      position: [6, 0, -63],
      width: 1.8,
      length: 12,
    },
    // Bridge 4: long
    {
      position: [6, 0, -89],
      width: N,
      length: 14,
    },
    // Bridge 5: longest and narrowest
    {
      position: [6, 0, -114],
      width: 1.6,
      length: 12,
    },
  ],
  obstacles: [
    // Shield before bridges section
    {
      position: [0, 0.75, -7],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving obstacle on landing 1
    {
      position: [0, 0.75, -25],
      size: [1, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 1.5, speed: 2 },
    },
    // TimeBonus on landing 2
    {
      position: [0, 0.75, -46],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle on bridge 3 landing
    {
      position: [6, 0.75, -74],
      size: [1, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 1.5, speed: 2.5 },
    },
    // Shield before hardest bridges
    {
      position: [6, 0.75, -98],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving obstacle on bridge 4 landing
    {
      position: [6, 0.75, -102],
      size: [1, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 1.5, speed: 2 },
    },
    // TimeBonus near end
    {
      position: [6, 0.75, -128],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Final moving blocker
    {
      position: [6, 0.75, -134],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
    },
  ],
};

export default level;
