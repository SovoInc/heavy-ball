import type { LevelData } from "./Level";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 4 — Moving Maze",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -128],
    size: [W, 3, 4],
  },
  paths: [
    // start area: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // first wide corridor: z -5 to -30
    { position: [0, 0, -17.5], size: [W, H, 25], noWalls: true },
    // turn right platform
    { position: [3, 0, -30], size: [W + 6, H, W], noWalls: true },
    // right corridor: z -33 to -55
    { position: [6, 0, -44], size: [W, H, 22], noWalls: true },
    // turn left platform
    { position: [3, 0, -55], size: [W + 6, H, W], noWalls: true },
    // back to center: z -58 to -80
    { position: [0, 0, -69], size: [W, H, 22], noWalls: true },
    // turn right platform
    { position: [3, 0, -80], size: [W + 6, H, W], noWalls: true },
    // right corridor: z -83 to -105
    { position: [6, 0, -94], size: [W, H, 22], noWalls: true },
    // turn left platform
    { position: [3, 0, -105], size: [W + 6, H, W], noWalls: true },
    // final stretch: z -108 to -132
    { position: [0, 0, -120], size: [W, H, 24], noWalls: true },
  ],
  obstacles: [
    // Moving obstacle in first corridor
    {
      position: [0, 0.75, -12],
      size: [1.2, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2 },
      powerUp: PowerUpType.TimeBonus,
    },
    // Stationary blocker
    {
      position: [1.5, 0.75, -22],
      size: [1, 1, 1],
      breakable: true,
    },
    // Moving obstacle in right corridor
    {
      position: [6, 0.75, -38],
      size: [1.2, 1, 1.2],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 2.5 },
      powerUp: PowerUpType.SpeedBoost,
    },
    // Stationary in right corridor
    {
      position: [7, 0.75, -48],
      size: [1, 1.2, 0.8],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle in center return
    {
      position: [0, 0.75, -64],
      size: [1, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
      powerUp: PowerUpType.SpeedBoost,
    },
    // Stationary in center return
    {
      position: [-1.5, 0.75, -74],
      size: [1.2, 1, 0.8],
      breakable: true,
    },
    // Moving in second right corridor
    {
      position: [6, 0.75, -90],
      size: [1.5, 1, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving in final stretch
    {
      position: [0, 0.75, -115],
      size: [1.2, 1.2, 1.2],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3 },
    },
  ],
};

export default level;
