import type { LevelData } from "./Level";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

export const LEVEL_3: LevelData = {
  name: "Level 3 — The Gauntlet",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [12, 1.5, -118],
    size: [W, 3, 4],
  },
  paths: [
    // start: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // first straight: z -5 to -22
    { position: [0, 0, -13.5], size: [W, H, 17], noWalls: true },
    // first turn connector
    { position: [3, 0, -22], size: [W + 6, H, W], noWalls: true },
    // right branch: z -25 to -40
    { position: [6, 0, -32.5], size: [W, H, 15], noWalls: true },
    // bridge approach: z -40 to -44
    { position: [6, 0, -42], size: [4, H, 4], noWalls: true },
    // post-bridge: z -50 to -60
    { position: [6, 0, -55], size: [W, H, 10], noWalls: true },
    // S-curve left connector
    { position: [3, 0, -60], size: [W + 6, H, W], noWalls: true },
    // left straight: z -63 to -75
    { position: [0, 0, -69], size: [W, H, 12], noWalls: true },
    // narrow bridge approach: z -75 to -78
    { position: [0, 0, -76.5], size: [3.5, H, 3], noWalls: true },
    // S-curve right connector
    { position: [3, 0, -86], size: [W + 6, H, W], noWalls: true },
    // right return: z -83 to -95
    { position: [6, 0, -89], size: [W, H, 12], noWalls: true },
    // second bridge approach: z -95 to -99
    { position: [6, 0, -97], size: [4, H, 4], noWalls: true },
    // turn to final
    { position: [9, 0, -107], size: [W + 6, H, W], noWalls: true },
    // final stretch: z -110 to -124
    { position: [12, 0, -117], size: [W, H, 14], noWalls: true },
  ],
  bridges: [
    {
      position: [6, 0, -47],
      width: N,
      length: 6,
    },
    {
      position: [0, 0, -81],
      width: 1.8,
      length: 6,
    },
    {
      position: [6, 0, -103],
      width: N,
      length: 8,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -10],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 1.6,
    },
    {
      position: [6, 0.25, -35],
      width: W,
      height: 2.5,
      gapSide: "right",
      gapWidth: 1.4,
    },
    {
      position: [0, 0.25, -72],
      width: W,
      height: 2.5,
      gapSide: "center",
      gapWidth: 1.4,
    },
    {
      position: [12, 0.25, -114],
      width: W,
      height: 3,
      gapSide: "left",
      gapWidth: 1.5,
    },
  ],
  obstacles: [
    { position: [-1.5, 0.75, -18], size: [1, 1, 1], color: 0x665544, breakable: true },
    { position: [7.5, 0.75, -37], size: [1, 1.5, 0.8], color: 0x665544, breakable: true },
    {
      position: [0, 0.75, -67],
      size: [1.2, 1, 1],
      color: 0x884444,
      breakable: true,
      moving: { axis: "x", range: 1.8, speed: 2 },
    },
    {
      position: [6, 0.75, -92],
      size: [1, 1, 1],
      color: 0x884444,
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    { position: [13, 0.75, -120], size: [1, 1, 0.6], color: 0x665544, breakable: true },
  ],
};
