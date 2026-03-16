import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const N = CONFIG.path.narrowWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 19 — Elemental Gauntlet",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -162],
    size: [W, 3, 4],
  },
  paths: [
    // ==========================================
    // SECTION 1: ICE CORRIDOR WITH WIND (z 0 to -40)
    // ==========================================

    // Starting platform (normal)
    { position: [0, 0, 0], size: [W, H, 10], noWalls: true },

    // Ice corridor with crosswind
    { position: [0, 0, -15], size: [W, H, 20], noWalls: true, surfaceType: SurfaceType.Ice },

    // Normal safe island mid-ice
    { position: [0, 0, -27], size: [W, H, 4], noWalls: true },

    // Second ice stretch
    { position: [0, 0, -35], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Ice },

    // ==========================================
    // SECTION 2: LAVA CROSSING WITH SAFE ISLANDS (z -41 to -75)
    // ==========================================

    // Normal transition platform
    { position: [0, 0, -43], size: [W, H, 4], noWalls: true },

    // Lava strip 1
    { position: [0, 0, -49], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Lava },

    // Safe island 1
    { position: [0, 0, -55], size: [W, H, 4], noWalls: true },

    // Lava strip 2 (narrower)
    { position: [0, 0, -61], size: [N + 1, H, 8], noWalls: true, surfaceType: SurfaceType.Lava },

    // Safe island 2
    { position: [0, 0, -67], size: [W, H, 4], noWalls: true },

    // Lava strip 3
    { position: [0, 0, -73], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Lava },

    // ==========================================
    // SECTION 3: BOUNCE PLATFORMS WITH ELEVATION (z -77 to -105)
    // ==========================================

    // Normal platform leading into bounce section
    { position: [0, 0, -79], size: [W, H, 4], noWalls: true },

    // Bounce pad (ground level)
    { position: [0, 0, -85], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Elevated bounce platform (y=3)
    { position: [0, 3, -91], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Ground level bounce pad
    { position: [0, 0, -97], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Normal landing platform
    { position: [0, 0, -103], size: [W, H, 4], noWalls: true },

    // ==========================================
    // SECTION 4: SPEED CONVEYOR MAZE (z -105 to -140)
    // Turn right, then left through conveyors
    // ==========================================

    // Turn right junction
    { position: [3, 0, -107], size: [W + 6, H, W], noWalls: true },

    // Speed conveyor pushing right (must resist)
    {
      position: [6, 0, -115],
      size: [W, H, 12],
      noWalls: true,
      surfaceType: SurfaceType.Speed,
      direction: [1, 0, 0],
    },

    // Normal breather
    { position: [6, 0, -123], size: [W, H, 4], noWalls: true },

    // Speed conveyor pushing forward (helps player)
    {
      position: [6, 0, -129],
      size: [W, H, 8],
      noWalls: true,
      surfaceType: SurfaceType.Speed,
      direction: [0, 0, -1],
    },

    // Turn left junction
    { position: [3, 0, -135], size: [W + 6, H, W], noWalls: true },

    // Speed conveyor pushing left (must resist)
    {
      position: [0, 0, -141],
      size: [W, H, 8],
      noWalls: true,
      surfaceType: SurfaceType.Speed,
      direction: [-1, 0, 0],
    },

    // ==========================================
    // SECTION 5: CRUMBLING FINALE (z -145 to -165)
    // ==========================================

    // Normal platform before crumbling
    { position: [0, 0, -147], size: [W, H, 4], noWalls: true },

    // Crumbling path segment 1
    { position: [0, 0, -151], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Crumbling },

    // Small normal island
    { position: [0, 0, -155], size: [W, H, 4], noWalls: true },

    // Crumbling path segment 2
    { position: [0, 0, -159], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Crumbling },

    // Finish platform
    { position: [0, 0, -163], size: [W, H, 4], noWalls: true },
  ],

  windZones: [
    // Crosswind on ice corridor, pushing right
    {
      position: [0, 1, -15],
      size: [W, 3, 20],
      direction: [1, 0, 0],
      strength: 5,
    },
    // Crosswind on second ice stretch, pushing left
    {
      position: [0, 1, -35],
      size: [W, 3, 12],
      direction: [-1, 0, 0],
      strength: 4.5,
    },
  ],

  timedGates: [
    // Gate between lava sections
    {
      position: [0, 0.5, -55],
      size: [W, 2, 0.5],
      onTime: 2.5,
      offTime: 2,
    },
    // Gate in speed conveyor section
    {
      position: [6, 0.5, -119],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2.5,
    },
    // Gate before crumbling finale
    {
      position: [0, 0.5, -149],
      size: [W, 2, 0.5],
      onTime: 2,
      offTime: 2,
    },
  ],

  latticeWalls: [
    // Wall in ice corridor
    {
      position: [0, 0.25, -20],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 2,
    },
    // Wall in lava section
    {
      position: [0, 0.25, -61],
      width: N + 1,
      height: 2,
      gapSide: "right",
      gapWidth: 1.5,
    },
    // Wall in speed conveyor corridor
    {
      position: [6, 0.25, -126],
      width: W,
      height: 2.5,
      gapSide: "center",
      gapWidth: 1.8,
    },
  ],

  obstacles: [
    // Shield before ice section
    {
      position: [0, 0.75, -4],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Stationary block on ice
    {
      position: [1.5, 0.75, -12],
      size: [1.2, 1, 0.8],
      breakable: true,
    },
    // Moving obstacle on ice
    {
      position: [0, 0.75, -33],
      size: [1, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // TimeBonus on safe island between lava
    {
      position: [0, 0.75, -55],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Stationary block on lava safe island 2
    {
      position: [1, 0.75, -67],
      size: [0.8, 1, 0.8],
      breakable: true,
    },
    // SpeedBoost before bounce section
    {
      position: [0, 0.75, -79],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Moving obstacle on bounce pad
    {
      position: [0, 0.75, -85],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2 },
    },
    // Shrink power-up before conveyor maze
    {
      position: [0, 0.75, -103],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shrink,
    },
    // Moving block on speed conveyor (right push)
    {
      position: [6, 0.75, -113],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3 },
    },
    // TimeFreeze in speed section
    {
      position: [6, 0.75, -129],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeFreeze,
    },
    // Moving obstacle on left-push conveyor
    {
      position: [0, 0.75, -141],
      size: [1, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
    },
    // Stationary block on crumbling section
    {
      position: [0.5, 0.75, -159],
      size: [0.8, 1, 0.8],
      breakable: true,
    },
  ],
};

export default level;
