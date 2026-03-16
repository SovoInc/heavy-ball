import type { LevelData } from "./Level";

const W = 6;
const H = 0.5;

const level: LevelData = {
  name: "Level 1 — The Basics",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -82],
    size: [W, 3, 4],
  },
  paths: [
    // start platform: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // straight: z -5 to -20
    { position: [0, 0, -12.5], size: [W, H, 15], noWalls: true },
    // past first lattice: z -20 to -35
    { position: [0, 0, -27.5], size: [W, H, 15], noWalls: true },
    // jog section: z -35 to -47
    { position: [1.5, 0, -41], size: [W + 3, H, 12], noWalls: true },
    // center return: z -47 to -60
    { position: [0, 0, -53.5], size: [W, H, 13], noWalls: true },
    // second obstacle zone: z -60 to -74
    { position: [0, 0, -67], size: [W, H, 14], noWalls: true },
    // final stretch: z -74 to -86
    { position: [0, 0, -80], size: [W, H, 12], noWalls: true },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -19],
      width: W,
      height: 2,
      gapSide: "right",
      gapWidth: 2,
    },
    {
      position: [1.5, 0.25, -38],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 2,
    },
    {
      position: [0, 0.25, -62],
      width: W,
      height: 2.5,
      gapSide: "center",
      gapWidth: 1.8,
    },
  ],
  obstacles: [
    { position: [-1.5, 0.75, -25], size: [1, 1, 1], color: 0x887766, breakable: true },
    { position: [1.5, 0.75, -50], size: [1, 1, 1], color: 0x887766, breakable: true },
    { position: [0, 0.75, -70], size: [1.2, 1, 0.6], color: 0x887766, breakable: true },
  ],
};

export default level;
