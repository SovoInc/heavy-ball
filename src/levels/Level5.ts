import type { LevelData } from "./Level";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

export const LEVEL_5: LevelData = {
  name: "Level 5 — The Squeeze",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -118],
    size: [3.5, 3, 4],
  },
  paths: [
    // start area: wide, z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // first section: wide, z -5 to -20
    { position: [0, 0, -12.5], size: [W, H, 15], noWalls: true },
    // narrowing section: z -20 to -30
    { position: [0, 0, -25], size: [3.5, H, 10], noWalls: true },
    // first tight corridor: z -30 to -48
    { position: [0, 0, -39], size: [3, H, 18], noWalls: true },
    // opens up briefly: z -48 to -55
    { position: [0, 0, -51.5], size: [W, H, 7], noWalls: true },
    // bridge approach: z -55 to -58
    { position: [0, 0, -56.5], size: [3, H, 3], noWalls: true },
    // after first bridge: z -64 to -72
    { position: [0, 0, -68], size: [3.5, H, 8], noWalls: true },
    // second tight corridor: z -72 to -88
    { position: [0, 0, -80], size: [3, H, 16], noWalls: true },
    // opens up: z -88 to -94
    { position: [0, 0, -91], size: [W, H, 6], noWalls: true },
    // bridge approach: z -94 to -97
    { position: [0, 0, -95.5], size: [3, H, 3], noWalls: true },
    // after second bridge: z -103 to -108
    { position: [0, 0, -105.5], size: [3.5, H, 5], noWalls: true },
    // final narrow stretch: z -108 to -122
    { position: [0, 0, -115], size: [3.5, H, 14], noWalls: true },
  ],
  bridges: [
    {
      position: [0, 0, -61],
      width: 1.8,
      length: 6,
    },
    {
      position: [0, 0, -100],
      width: 1.8,
      length: 6,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -16],
      width: W,
      height: 2,
      gapSide: "center",
      gapWidth: 1.6,
    },
    {
      position: [0, 0.25, -42],
      width: 3,
      height: 2.5,
      gapSide: "center",
      gapWidth: 1.2,
    },
  ],
  obstacles: [
    // Shrink power-up before first narrow section
    {
      position: [0, 0.75, -18],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shrink,
    },
    // Blocker in first tight corridor
    {
      position: [0.5, 0.75, -35],
      size: [0.8, 1, 0.8],
      breakable: true,
    },
    // Shrink power-up before second tight corridor
    {
      position: [0, 0.75, -53],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shrink,
    },
    // Stationary in second tight corridor
    {
      position: [-0.5, 0.75, -76],
      size: [0.8, 1, 0.8],
      breakable: true,
    },
    // Moving obstacle in second tight corridor
    {
      position: [0, 0.75, -84],
      size: [1, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 1, speed: 2 },
    },
    // Shrink before final narrow stretch
    {
      position: [0, 0.75, -92],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shrink,
    },
    // Blocker in final stretch
    {
      position: [0, 0.75, -112],
      size: [0.8, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 1, speed: 1.5 },
    },
  ],
};
