import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

export const LEVEL_18: LevelData = {
  name: "Level 18 — Vanishing Act",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -132],
    size: [W, 3, 4],
  },
  paths: [
    // Start area: safe normal ground (z 0 to -8)
    { position: [0, 0, -4], size: [W, H, 8], noWalls: true },

    // Ice slide into first crumbling section (z -8 to -18)
    { position: [0, 0, -13], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Ice },

    // Crumbling section 1: slides off ice onto crumbling (z -18 to -28)
    { position: [0, 0, -23], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },

    // Safe platform 1 (z -28 to -34)
    { position: [0, 0, -31], size: [W, H, 6], noWalls: true },

    // Short ice patch leading to narrow crumbling (z -34 to -40)
    { position: [0, 0, -37], size: [W, H, 6], noWalls: true, surfaceType: SurfaceType.Ice },

    // Narrow crumbling section — less time to react (z -40 to -50)
    { position: [0, 0, -45], size: [4, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },

    // Safe platform 2 (z -50 to -55)
    { position: [0, 0, -52.5], size: [W, H, 5], noWalls: true },

    // Turn right (z -55)
    { position: [3, 0, -55], size: [W + 6, H, W], noWalls: true },

    // Ice corridor heading south (z -58 to -70)
    { position: [6, 0, -64], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Ice },

    // Crumbling section 3 — wide but crumbles fast (z -70 to -80)
    { position: [6, 0, -75], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },

    // Safe platform 3 (z -80 to -85)
    { position: [6, 0, -82.5], size: [W, H, 5], noWalls: true },

    // Turn left (z -85)
    { position: [3, 0, -85], size: [W + 6, H, W], noWalls: true },

    // Ice into crumbling gauntlet (z -88 to -96)
    { position: [0, 0, -92], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Ice },

    // Crumbling section 4 (z -96 to -104)
    { position: [0, 0, -100], size: [4.5, H, 8], noWalls: true, surfaceType: SurfaceType.Crumbling },

    // Safe platform 4 (z -104 to -109)
    { position: [0, 0, -106.5], size: [W, H, 5], noWalls: true },

    // Final ice slide (z -109 to -117)
    { position: [0, 0, -113], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Ice },

    // Final crumbling stretch — sprint to finish (z -117 to -127)
    { position: [0, 0, -122], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Crumbling },

    // Finish platform (z -127 to -134)
    { position: [0, 0, -130.5], size: [W, H, 7], noWalls: true },
  ],
  timedGates: [
    // Gate before first crumbling section — forces timing
    {
      position: [0, 0.5, -17],
      size: [W, 2, 0.5],
      onTime: 2.5,
      offTime: 2,
    },
    // Gate in ice corridor
    {
      position: [6, 0.5, -66],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2.5,
    },
    // Gate before final crumbling gauntlet
    {
      position: [0, 0.5, -95],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2,
    },
    // Gate on final crumbling stretch
    {
      position: [0, 0.5, -120],
      size: [W, 2, 0.5],
      onTime: 2.5,
      offTime: 1.5,
    },
  ],
  obstacles: [
    // Shield before first ice section
    {
      position: [0, 0.75, -7],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Stationary block on first crumbling section
    {
      position: [1.5, 0.75, -24],
      size: [1, 1, 0.8],
      breakable: true,
    },
    // TimeFreeze on safe platform 1
    {
      position: [0, 0.75, -32],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeFreeze,
    },
    // Moving obstacle on ice corridor
    {
      position: [6, 0.75, -62],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // Shield before wide crumbling section
    {
      position: [6, 0.75, -71],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving obstacle on crumbling gauntlet
    {
      position: [0, 0.75, -99],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
    },
    // TimeFreeze before final stretch
    {
      position: [0, 0.75, -108],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeFreeze,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -43],
      width: 4,
      height: 2,
      gapSide: "right",
      gapWidth: 1.6,
    },
    {
      position: [6, 0.25, -77],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 1.8,
    },
  ],
};
