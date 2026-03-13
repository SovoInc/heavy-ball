import type { LevelData } from "./Level";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

export const LEVEL_2: LevelData = {
  name: "Level 2 — Narrow Bridges",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -102],
    size: [W, 3, 4],
  },
  paths: [
    // start: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // approach bridge: z -5 to -16
    { position: [0, 0, -10.5], size: [W, H, 11], noWalls: true },
    // after bridge: z -24 to -34
    { position: [0, 0, -29], size: [W, H, 10], noWalls: true },
    // left turn platform
    { position: [-3, 0, -34], size: [W + 6, H, W], noWalls: true },
    // left corridor: z -37 to -54
    { position: [-6, 0, -45.5], size: [W, H, 17], noWalls: true },
    // right turn back
    { position: [-3, 0, -54], size: [W + 6, H, W], noWalls: true },
    // narrower section: z -57 to -68
    { position: [0, 0, -62.5], size: [4, H, 11], noWalls: true },
    // wider again: z -68 to -80
    { position: [0, 0, -74], size: [W, H, 12], noWalls: true },
    // bridge approach: z -80 to -86
    { position: [0, 0, -83], size: [W, H, 6], noWalls: true },
    // final: z -94 to -106
    { position: [0, 0, -100], size: [W, H, 12], noWalls: true },
  ],
  bridges: [
    {
      position: [0, 0, -20],
      width: N,
      length: 8,
    },
    {
      position: [0, 0, -90],
      width: N,
      length: 8,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -13],
      width: W,
      height: 2,
      gapSide: "right",
      gapWidth: 1.8,
    },
    {
      position: [-6, 0.25, -48],
      width: W,
      height: 2.5,
      gapSide: "left",
      gapWidth: 1.6,
    },
    {
      position: [0, 0.25, -77],
      width: W,
      height: 2,
      gapSide: "center",
      gapWidth: 1.6,
    },
  ],
  obstacles: [
    { position: [1.5, 0.75, -31], size: [1.2, 1, 0.8], color: 0x776655, breakable: true },
    { position: [-7.5, 0.75, -50], size: [1, 1, 1], color: 0x776655, breakable: true },
    { position: [0, 0.75, -65], size: [2, 1, 0.6], color: 0x776655, breakable: true },
  ],
};
