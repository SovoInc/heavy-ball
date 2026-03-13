import type { LevelData } from "./Level";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

export const LEVEL_7: LevelData = {
  name: "Level 7 — Rotating Gauntlet",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -138],
    size: [W, 3, 4],
  },
  paths: [
    // start area: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // first gauntlet: z -5 to -30
    { position: [0, 0, -17.5], size: [W, H, 25], noWalls: true },
    // breather: z -30 to -38
    { position: [0, 0, -34], size: [W, H, 8], noWalls: true },
    // turn right
    { position: [3, 0, -38], size: [W + 6, H, W], noWalls: true },
    // right gauntlet: z -41 to -66
    { position: [6, 0, -53.5], size: [W, H, 25], noWalls: true },
    // breather: z -66 to -72
    { position: [6, 0, -69], size: [W, H, 6], noWalls: true },
    // turn left
    { position: [3, 0, -72], size: [W + 6, H, W], noWalls: true },
    // center gauntlet: z -75 to -100
    { position: [0, 0, -87.5], size: [W, H, 25], noWalls: true },
    // breather: z -100 to -106
    { position: [0, 0, -103], size: [W, H, 6], noWalls: true },
    // turn right
    { position: [3, 0, -106], size: [W + 6, H, W], noWalls: true },
    // final gauntlet: z -109 to -142
    { position: [6, 0, -125.5], size: [W, H, 33], noWalls: true },
    // turn left to finish
    { position: [3, 0, -133], size: [W + 6, H, W], noWalls: true },
    // finish area
    { position: [0, 0, -138], size: [W, H, 10], noWalls: true },
  ],
  obstacles: [
    // Gauntlet 1: fast moving obstacles
    {
      position: [0, 0.75, -10],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3.5 },
    },
    {
      position: [0, 0.75, -18],
      size: [1.2, 1.2, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 4 },
      powerUp: PowerUpType.TimeFreeze,
    },
    {
      position: [0, 0.75, -26],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3 },
    },
    // Gauntlet 2: crossing obstacles
    {
      position: [6, 0.75, -46],
      size: [1.2, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3.5 },
    },
    {
      position: [6, 0.75, -54],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 4 },
      powerUp: PowerUpType.TimeFreeze,
    },
    {
      position: [6, 0.75, -62],
      size: [1.2, 1.2, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3.5 },
    },
    // Gauntlet 3: denser obstacles
    {
      position: [0, 0.75, -80],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3.5 },
    },
    {
      position: [0, 0.75, -87],
      size: [1.5, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 4 },
      powerUp: PowerUpType.TimeFreeze,
    },
    {
      position: [0, 0.75, -94],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
    },
    // Final gauntlet: hardest
    {
      position: [6, 0.75, -114],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 4 },
    },
    {
      position: [6, 0.75, -121],
      size: [1.2, 1.2, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3.5 },
      powerUp: PowerUpType.TimeBonus,
    },
    {
      position: [6, 0.75, -128],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 4 },
    },
  ],
};
