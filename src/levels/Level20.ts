import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 20 — The True Finale",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [12, 1.5, -185],
    size: [W, 3, 4],
  },
  paths: [
    // ==========================================
    // ACT 1: THE OPENING (z 0 to -40)
    // Normal start into ice + wind gauntlet
    // ==========================================

    // Starting platform
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },

    // Ice corridor with crosswind
    { position: [0, 0, -13], size: [W, H, 16], noWalls: true, surfaceType: SurfaceType.Ice },

    // Normal breather
    { position: [0, 0, -23], size: [W, H, 4], noWalls: true },

    // Ice section with stronger wind
    { position: [0, 0, -31], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Ice },

    // Safe platform before turn
    { position: [0, 0, -39], size: [W, H, 4], noWalls: true },

    // ==========================================
    // ACT 2: LAVA GAUNTLET (z -41 to -75)
    // Turn right, cross lava with bridges over danger
    // ==========================================

    // Turn right
    { position: [3, 0, -43], size: [W + 6, H, W], noWalls: true },

    // Lava approach
    {
      position: [6, 0, -50],
      size: [W, H, 8],
      noWalls: true,
      surfaceType: SurfaceType.Lava,
    },

    // Safe island 1
    { position: [6, 0, -56], size: [W, H, 4], noWalls: true },

    // Lava strip 2
    {
      position: [6, 0, -62],
      size: [W, H, 8],
      noWalls: true,
      surfaceType: SurfaceType.Lava,
    },

    // Safe island 2
    { position: [6, 0, -68], size: [W, H, 4], noWalls: true },

    // Lava strip 3 (narrow)
    {
      position: [6, 0, -74],
      size: [N + 1, H, 8],
      noWalls: true,
      surfaceType: SurfaceType.Lava,
    },

    // Recovery platform
    { position: [6, 0, -80], size: [W, H, 4], noWalls: true },

    // ==========================================
    // ACT 3: BOUNCE ASCENT (z -82 to -110)
    // Turn left, bounce platforms with elevation changes
    // ==========================================

    // Turn left
    { position: [3, 0, -84], size: [W + 6, H, W], noWalls: true },

    // Normal lead-in
    { position: [0, 0, -90], size: [W, H, 6], noWalls: true },

    // Bounce pad 1 (ground)
    { position: [0, 0, -96], size: [W, H, 6], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Elevated platform
    { position: [0, 3, -101], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Ground bounce pad 2
    { position: [0, 0, -105], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Elevated platform 2
    { position: [0, 3, -111], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Landing platform
    { position: [0, 0, -116], size: [W, H, 6], noWalls: true },

    // ==========================================
    // ACT 4: SPEED CONVEYOR LABYRINTH (z -119 to -155)
    // Turn right, navigate conveyors with timed gates
    // ==========================================

    // Turn right
    { position: [3, 0, -121], size: [W + 6, H, W], noWalls: true },

    // Speed conveyor pushing right (fight it)
    {
      position: [6, 0, -128],
      size: [W, H, 10],
      noWalls: true,
      surfaceType: SurfaceType.Speed,
      direction: [1, 0, 0],
    },

    // Normal checkpoint
    { position: [6, 0, -135], size: [W, H, 4], noWalls: true },

    // Speed conveyor pushing backward (fight it)
    {
      position: [6, 0, -141],
      size: [W, H, 8],
      noWalls: true,
      surfaceType: SurfaceType.Speed,
      direction: [0, 0, 1],
    },

    // Normal platform
    { position: [6, 0, -147], size: [W, H, 4], noWalls: true },

    // Speed conveyor pushing forward (fast ride)
    {
      position: [6, 0, -153],
      size: [3, H, 8],
      noWalls: true,
      surfaceType: SurfaceType.Speed,
      direction: [0, 0, -1],
    },

    // Platform before turn
    { position: [6, 0, -159], size: [W, H, 4], noWalls: true },

    // ==========================================
    // ACT 5: THE ULTIMATE FINALE (z -161 to -190)
    // Turn right, crumbling + ice + lava combined gauntlet
    // ==========================================

    // Turn right
    { position: [9, 0, -163], size: [W + 6, H, W], noWalls: true },

    // Crumbling section 1 (must move fast!)
    {
      position: [12, 0, -168],
      size: [W, H, 4],
      noWalls: true,
      surfaceType: SurfaceType.Crumbling,
    },

    // Small ice patch
    {
      position: [12, 0, -173],
      size: [W, H, 6],
      noWalls: true,
      surfaceType: SurfaceType.Ice,
    },

    // Crumbling section 2
    {
      position: [12, 0, -178],
      size: [W, H, 4],
      noWalls: true,
      surfaceType: SurfaceType.Crumbling,
    },

    // Normal platform before lava sprint
    { position: [12, 0, -182], size: [W, H, 4], noWalls: true },

    // Finish platform
    { position: [12, 0, -186], size: [W, H, 4], noWalls: true },
  ],

  bridges: [
    // Bridge over lava strip 1
    {
      position: [6, 0, -50],
      width: 1.6,
      length: 8,
    },
    // Bridge over narrow lava strip 3
    {
      position: [6, 0, -74],
      width: 1.4,
      length: 8,
    },
    // Bridge over gap in final section (between crumbling platforms)
    {
      position: [12, 0, -178],
      width: 1.5,
      length: 4,
    },
  ],

  windZones: [
    // Wind on first ice corridor, pushing right
    {
      position: [0, 1, -13],
      size: [W, 3, 16],
      direction: [1, 0, 0],
      strength: 4.5,
    },
    // Stronger wind on second ice section, pushing left
    {
      position: [0, 1, -31],
      size: [W, 3, 12],
      direction: [-1, 0, 0],
      strength: 5.5,
    },
    // Wind in final ice patch, pushing right
    {
      position: [12, 1, -173],
      size: [W, 3, 6],
      direction: [1, 0, 0],
      strength: 5,
    },
  ],

  timedGates: [
    // Gate in lava section
    {
      position: [6, 0.5, -56],
      size: [W, 2, 0.5],
      onTime: 2.5,
      offTime: 2,
    },
    // Gate in speed conveyor section
    {
      position: [6, 0.5, -131],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2.5,
    },
    // Gate between speed conveyors
    {
      position: [6, 0.5, -144],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2,
    },
    // Gate in final gauntlet
    {
      position: [12, 0.5, -170],
      size: [W, 2, 0.5],
      onTime: 1.5,
      offTime: 2.5,
    },
  ],

  latticeWalls: [
    // Wall in ice section
    {
      position: [0, 0.25, -18],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 2,
    },
    // Wall in lava section
    {
      position: [6, 0.25, -62],
      width: W,
      height: 2,
      gapSide: "right",
      gapWidth: 1.8,
    },
    // Wall in bounce section
    {
      position: [0, 0.25, -93],
      width: W,
      height: 2.5,
      gapSide: "center",
      gapWidth: 2,
    },
    // Wall in speed conveyor section
    {
      position: [6, 0.25, -139],
      width: W,
      height: 2.5,
      gapSide: "left",
      gapWidth: 1.6,
    },
    // Wall in final section
    {
      position: [12, 0.25, -175],
      width: W,
      height: 3,
      gapSide: "center",
      gapWidth: 1.4,
    },
  ],

  obstacles: [
    // --- ACT 1: Ice section ---
    // Shield before ice
    {
      position: [0, 0.75, -4],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving block on ice
    {
      position: [0, 0.75, -16],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // Stationary on second ice stretch
    {
      position: [1.5, 0.75, -29],
      size: [1, 1, 0.8],
      breakable: true,
    },

    // --- ACT 2: Lava section ---
    // TimeBonus on safe island 1
    {
      position: [6, 0.75, -56],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving block near safe island 2
    {
      position: [6, 0.75, -66],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
    },

    // --- ACT 3: Bounce section ---
    // SpeedBoost before bouncing
    {
      position: [0, 0.75, -90],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Moving obstacle on ground bounce pad
    {
      position: [0, 0.75, -96],
      size: [1, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // Stationary on landing
    {
      position: [-1, 0.75, -116],
      size: [0.8, 1, 0.8],
      breakable: true,
    },

    // --- ACT 4: Speed conveyors ---
    // Shrink before conveyors
    {
      position: [6, 0.75, -124],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shrink,
    },
    // Fast moving block on right-push conveyor
    {
      position: [6, 0.75, -128],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3.5 },
    },
    // Moving block on backward-push conveyor
    {
      position: [6, 0.75, -141],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "z", range: 2, speed: 3 },
    },
    // TimeFreeze on narrow forward conveyor
    {
      position: [6, 0.75, -153],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeFreeze,
    },
    // Fast moving block before turn
    {
      position: [6, 0.75, -157],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 4 },
    },

    // --- ACT 5: The Ultimate Finale ---
    // Shield before the end
    {
      position: [12, 0.75, -165],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Fast moving block on crumbling section
    {
      position: [12, 0.75, -173],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 4 },
    },
  ],
};

export default level;
