import type { LevelData } from "./Level";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

export const LEVEL_10: LevelData = {
  name: "Level 10 — The Finale",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -168],
    size: [W, 3, 4],
  },
  paths: [
    // start area: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // first section: wind gauntlet z -5 to -30
    { position: [0, 0, -17.5], size: [W + 2, H, 25], noWalls: true },
    // platform before bridge: z -30 to -35
    { position: [0, 0, -32.5], size: [3.5, H, 5], noWalls: true },
    // after bridge 1: z -43 to -50
    { position: [0, 0, -46.5], size: [W, H, 7], noWalls: true },
    // turn right
    { position: [3, 0, -50], size: [W + 6, H, W], noWalls: true },
    // moving obstacle corridor: z -53 to -75
    { position: [6, 0, -64], size: [W, H, 22], noWalls: true },
    // timed gate section: z -75 to -95
    { position: [6, 0, -85], size: [W, H, 20], noWalls: true },
    // turn left
    { position: [3, 0, -95], size: [W + 6, H, W], noWalls: true },
    // narrow wind section: z -98 to -115
    { position: [0, 0, -106.5], size: [3.5, H, 17], noWalls: true },
    // platform before bridge 2: z -115 to -118
    { position: [0, 0, -116.5], size: [3, H, 3], noWalls: true },
    // after bridge 2: z -126 to -132
    { position: [0, 0, -129], size: [W, H, 6], noWalls: true },
    // turn right
    { position: [3, 0, -132], size: [W + 6, H, W], noWalls: true },
    // platform before bridge 3: z -135 to -138
    { position: [6, 0, -136.5], size: [3, H, 3], noWalls: true },
    // after bridge 3: z -146 to -152
    { position: [6, 0, -149], size: [W, H, 6], noWalls: true },
    // turn left to finish
    { position: [3, 0, -152], size: [W + 6, H, W], noWalls: true },
    // final gauntlet: z -155 to -172
    { position: [0, 0, -163.5], size: [W, H, 17], noWalls: true },
  ],
  bridges: [
    // Bridge 1: over chasm after wind section
    {
      position: [0, 0, -39],
      width: 1.8,
      length: 8,
    },
    // Bridge 2: narrow in wind
    {
      position: [0, 0, -122],
      width: 1.6,
      length: 8,
    },
    // Bridge 3: final bridge
    {
      position: [6, 0, -142],
      width: N,
      length: 8,
    },
  ],
  windZones: [
    // Wind in first section: pushes right
    {
      position: [0, 1, -17.5],
      size: [W + 2, 3, 23],
      direction: [1, 0, 0],
      strength: 4.5,
    },
    // Wind in narrow section: pushes left
    {
      position: [0, 1, -106.5],
      size: [3.5, 3, 15],
      direction: [-1, 0, 0],
      strength: 5,
    },
    // Wind in final gauntlet: pushes right
    {
      position: [0, 1, -163.5],
      size: [W, 3, 15],
      direction: [1, 0, 0],
      strength: 5.5,
    },
  ],
  timedGates: [
    // Gate in timed gate section
    {
      position: [6, 0.5, -80],
      size: [W, 2, 0.5],
      onTime: 2.5,
      offTime: 2,
    },
    // Second gate
    {
      position: [6, 0.5, -88],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2.5,
    },
    // Gate before final stretch
    {
      position: [0, 0.5, -158],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -12],
      width: W + 2,
      height: 2,
      gapSide: "right",
      gapWidth: 1.8,
    },
    {
      position: [6, 0.25, -60],
      width: W,
      height: 2.5,
      gapSide: "left",
      gapWidth: 1.6,
    },
    {
      position: [0, 0.25, -160],
      width: W,
      height: 3,
      gapSide: "center",
      gapWidth: 1.4,
    },
  ],
  obstacles: [
    // Shield before wind section
    {
      position: [0, 0.75, -7],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving in wind section
    {
      position: [0, 0.75, -22],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // TimeBonus after bridge 1
    {
      position: [0, 0.75, -47],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Fast moving obstacles in corridor
    {
      position: [6, 0.75, -57],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3.5 },
    },
    {
      position: [6, 0.75, -65],
      size: [1.2, 1.2, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 4 },
      powerUp: PowerUpType.TimeFreeze,
    },
    // SpeedBoost before timed gates
    {
      position: [6, 0.75, -76],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Moving obstacle between timed gates
    {
      position: [6, 0.75, -84],
      size: [1, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
    },
    // Shrink before narrow wind section
    {
      position: [0, 0.75, -100],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shrink,
    },
    // Stationary in narrow wind section
    {
      position: [0.3, 0.75, -110],
      size: [0.8, 1, 0.8],
      breakable: true,
    },
    // Shield before final bridges
    {
      position: [0, 0.75, -129],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving on final gauntlet
    {
      position: [0, 0.75, -162],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 4 },
      powerUp: PowerUpType.TimeFreeze,
    },
    // Last moving obstacle
    {
      position: [0, 0.75, -167],
      size: [1.2, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3.5 },
    },
  ],
};
