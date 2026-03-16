import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 13 — Trampoline Park",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 5.5, -130],
    size: [W, 3, 4],
  },
  paths: [
    // Ground start platform y=0 (z 0 to -10)
    { position: [0, 0, -5], size: [W, H, 10], noWalls: true },
    // Bounce pad 1: launches ball up (z -10 to -14)
    { position: [0, 0, -12], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },
    // Upper platform y=2 (z -14 to -26)
    { position: [0, 2, -20], size: [W, H, 12], noWalls: true },
    // Drop back to ground level y=0 (z -26 to -34)
    { position: [0, 0, -30], size: [W, H, 8], noWalls: true },
    // Bounce pad 2: launches to y=2 (z -34 to -38)
    { position: [0, 0, -36], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },
    // Mid platform y=2 (z -38 to -48)
    { position: [0, 2, -43], size: [W, H, 10], noWalls: true },
    // Bounce pad 3 at y=2: launches to y=4 (z -48 to -52)
    { position: [0, 2, -50], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },
    // High platform y=4 (z -52 to -64)
    { position: [0, 4, -58], size: [W, H, 12], noWalls: true },
    // Turn right at y=4 (z -64)
    { position: [3, 4, -64], size: [W + 6, H, W], noWalls: true },
    // Drop to ground y=0 (z -67 to -74)
    { position: [6, 0, -70.5], size: [W, H, 7], noWalls: true },
    // Bounce pad 4: big launch (z -74 to -78)
    { position: [6, 0, -76], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },
    // High platform y=4 (z -78 to -88)
    { position: [6, 4, -83], size: [W, H, 10], noWalls: true },
    // Turn left at y=4 (z -88)
    { position: [3, 4, -88], size: [W + 6, H, W], noWalls: true },
    // Drop to y=2 (z -91 to -98)
    { position: [0, 2, -94.5], size: [W, H, 7], noWalls: true },
    // Bounce pad 5 at y=2 (z -98 to -102)
    { position: [0, 2, -100], size: [W, H, 4], noWalls: true, surfaceType: SurfaceType.Bounce },
    // High platform y=4 final stretch (z -102 to -128)
    { position: [0, 4, -115], size: [W, H, 26], noWalls: true },
  ],
  obstacles: [
    // SpeedBoost on start platform
    {
      position: [0, 0.75, -7],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Stationary block on first upper platform
    {
      position: [1.5, 2.75, -22],
      size: [1, 1, 0.8],
      breakable: true,
    },
    // TimeBonus on ground before bounce pad 2
    {
      position: [0, 0.75, -31],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle on mid platform y=2
    {
      position: [0, 2.75, -44],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // SpeedBoost on high platform y=4
    {
      position: [0, 4.75, -56],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Moving obstacle on high platform y=4
    {
      position: [0, 4.75, -61],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3 },
    },
    // Stationary block after drop
    {
      position: [5, 0.75, -72],
      size: [1, 1, 0.8],
      breakable: true,
    },
    // TimeBonus on second high platform
    {
      position: [6, 4.75, -83],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle on final stretch
    {
      position: [0, 4.75, -110],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3 },
    },
    // Moving obstacle near finish
    {
      position: [0, 4.75, -120],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 3.5 },
    },
  ],
  latticeWalls: [
    {
      position: [0, 2.25, -18],
      width: W,
      height: 2,
      gapSide: "right",
      gapWidth: 2,
    },
    {
      position: [0, 4.25, -118],
      width: W,
      height: 2.5,
      gapSide: "center",
      gapWidth: 1.8,
    },
  ],
};

export default level;
