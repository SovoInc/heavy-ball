import type { LevelData } from "./Level";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 8 — The Labyrinth",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -148],
    size: [W, 3, 4],
  },
  paths: [
    // start area: z +5 to -5
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },
    // first corridor: z -5 to -25
    { position: [0, 0, -15], size: [W, H, 20], noWalls: true },
    // T-junction: branch left and right
    { position: [0, 0, -25], size: [W + 12, H, W], noWalls: true },
    // left dead-end branch: z -28 to -40 (reward)
    { position: [-6, 0, -34], size: [W, H, 12], noWalls: true },
    // right branch continues: z -28 to -45
    { position: [6, 0, -36.5], size: [W, H, 17], noWalls: true },
    // right branch turns left
    { position: [3, 0, -45], size: [W + 6, H, W], noWalls: true },
    // center corridor: z -48 to -68
    { position: [0, 0, -58], size: [W, H, 20], noWalls: true },
    // second T-junction
    { position: [0, 0, -68], size: [W + 12, H, W], noWalls: true },
    // right dead-end branch: z -71 to -82 (reward)
    { position: [6, 0, -76.5], size: [W, H, 11], noWalls: true },
    // left branch continues: z -71 to -90
    { position: [-6, 0, -80.5], size: [W, H, 19], noWalls: true },
    // left branch turns right
    { position: [-3, 0, -90], size: [W + 6, H, W], noWalls: true },
    // center corridor with timed gates: z -93 to -115
    { position: [0, 0, -104], size: [W, H, 22], noWalls: true },
    // another junction
    { position: [0, 0, -115], size: [W + 12, H, W], noWalls: true },
    // left dead-end: z -118 to -128 (reward)
    { position: [-6, 0, -123], size: [W, H, 10], noWalls: true },
    // right continues
    { position: [6, 0, -123], size: [W, H, 10], noWalls: true },
    // turn back to center
    { position: [3, 0, -128], size: [W + 6, H, W], noWalls: true },
    // final stretch: z -131 to -152
    { position: [0, 0, -141.5], size: [W, H, 21], noWalls: true },
  ],
  timedGates: [
    // Gate blocking left dead-end entrance
    {
      position: [-6, 0.5, -29],
      size: [W, 2, 0.5],
      onTime: 3,
      offTime: 2.5,
    },
    // Gate in center corridor
    {
      position: [0, 0.5, -100],
      size: [W, 2, 0.5],
      onTime: 2.5,
      offTime: 3,
    },
    // Gate near right dead-end
    {
      position: [6, 0.5, -72],
      size: [W, 2, 0.5],
      onTime: 3,
      offTime: 2,
    },
    // Gate in final section
    {
      position: [0, 0.5, -138],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 3,
    },
  ],
  obstacles: [
    // Reward in left dead-end: TimeFreeze
    {
      position: [-6, 0.75, -38],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeFreeze,
    },
    // Blocker in right branch
    {
      position: [6, 0.75, -32],
      size: [1.2, 1, 0.8],
      breakable: true,
    },
    // TimeBonus in center corridor
    {
      position: [0, 0.75, -55],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle in center corridor
    {
      position: [0, 0.75, -63],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2 },
    },
    // Reward in right dead-end: Shield
    {
      position: [6, 0.75, -80],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // SpeedBoost in left branch
    {
      position: [-6, 0.75, -84],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Moving blocker near timed gates
    {
      position: [0, 0.75, -108],
      size: [1, 1.2, 1],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // Reward in left dead-end 2: Shrink
    {
      position: [-6, 0.75, -126],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shrink,
    },
    // Blocker in final stretch
    {
      position: [0, 0.75, -145],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -12],
      width: W,
      height: 2,
      gapSide: "center",
      gapWidth: 1.8,
    },
    {
      position: [0, 0.25, -95],
      width: W,
      height: 2.5,
      gapSide: "left",
      gapWidth: 1.6,
    },
  ],
};

export default level;
