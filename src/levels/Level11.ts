import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 11 — Frozen Path",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -120],
    size: [W, 3, 4],
  },
  paths: [
    // Start area: normal surface (z 0 to -10)
    { position: [0, 0, -5], size: [W, H, 10], noWalls: true },
    // Transition to ice (z -10 to -22)
    { position: [0, 0, -16], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal safe island (z -22 to -28)
    { position: [0, 0, -25], size: [W, H, 6], noWalls: true },
    // Long ice section with wind zone 1 (z -28 to -48)
    { position: [0, 0, -38], size: [W, H, 20], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal rest stop (z -48 to -54)
    { position: [0, 0, -51], size: [W, H, 6], noWalls: true },
    // Turn right on ice (z -54)
    { position: [3, 0, -54], size: [W + 6, H, W], noWalls: true, surfaceType: SurfaceType.Ice },
    // Ice corridor heading south (z -57 to -75)
    { position: [6, 0, -66], size: [W, H, 18], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal platform (z -75 to -80)
    { position: [6, 0, -77.5], size: [W, H, 5], noWalls: true },
    // Turn left (z -80)
    { position: [3, 0, -80], size: [W + 6, H, W], noWalls: true },
    // Ice section with wind zone 2 (z -83 to -100)
    { position: [0, 0, -91.5], size: [W, H, 17], noWalls: true, surfaceType: SurfaceType.Ice },
    // Normal platform (z -100 to -105)
    { position: [0, 0, -102.5], size: [W, H, 5], noWalls: true },
    // Final ice stretch to finish (z -105 to -118)
    { position: [0, 0, -111.5], size: [W, H, 13], noWalls: true, surfaceType: SurfaceType.Ice },
  ],
  windZones: [
    // Wind pushing sideways on first long ice section
    {
      position: [0, 1, -38],
      size: [W, 3, 18],
      direction: [1, 0, 0],
      strength: 4,
    },
    // Wind pushing sideways on ice corridor
    {
      position: [6, 1, -66],
      size: [W, 3, 16],
      direction: [-1, 0, 0],
      strength: 4.5,
    },
    // Wind on final ice stretch
    {
      position: [0, 1, -111.5],
      size: [W, 3, 11],
      direction: [1, 0, 0],
      strength: 5,
    },
  ],
  obstacles: [
    // Shield before first ice section
    {
      position: [0, 0.75, -9],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Stationary block on first ice section
    {
      position: [1.5, 0.75, -32],
      size: [1.2, 1, 0.8],
      breakable: true,
    },
    // Shield on normal rest stop
    {
      position: [0, 0.75, -51],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving obstacle on ice corridor
    {
      position: [6, 0.75, -62],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // Stationary block on ice corridor
    {
      position: [7, 0.75, -70],
      size: [1, 1, 0.8],
      breakable: true,
    },
    // Shield on normal platform before final stretch
    {
      position: [0, 0.75, -102],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.Shield,
    },
    // Moving obstacle on final ice stretch
    {
      position: [0, 0.75, -108],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3 },
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -42],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 2,
    },
    {
      position: [6, 0.25, -72],
      width: W,
      height: 2,
      gapSide: "right",
      gapWidth: 1.8,
    },
  ],
};

export default level;
