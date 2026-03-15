import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";
import { PowerUpType } from "../powerups/PowerUpType";

const W = CONFIG.path.wideWidth;
const H = 0.5;

export const LEVEL_17: LevelData = {
  name: "Level 17 — Bounce Highway",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -142],
    size: [W, 3, 4],
  },
  paths: [
    // Start area: normal (z 0 to -8)
    { position: [0, 0, -4], size: [W, H, 8], noWalls: true },

    // Speed strip 1: launches ball forward (z -8 to -18)
    { position: [0, 0, -13], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, -1] },

    // Bounce pad section 1 at ground level (z -18 to -30)
    { position: [0, 0, -24], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Normal landing platform (z -30 to -36)
    { position: [0, 0, -33], size: [W, H, 6], noWalls: true },

    // Speed strip 2: faster launch (z -36 to -44)
    { position: [0, 0, -40], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, -1] },

    // Bounce pads at ground level (z -44 to -56)
    { position: [0, 0, -50], size: [W, H, 12], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Drop down to normal platform (z -56 to -62)
    { position: [0, 0, -59], size: [W, H, 6], noWalls: true },

    // Turn right (z -62)
    { position: [3, 0, -62], size: [W + 6, H, W], noWalls: true },

    // Speed strip 3 heading south (z -65 to -75)
    { position: [6, 0, -70], size: [W, H, 10], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, -1] },

    // Bounce pads at ground level (z -75 to -88)
    { position: [6, 0, -81.5], size: [W, H, 13], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Landing platform after big bounce (z -88 to -94)
    { position: [6, 0, -91], size: [W, H, 6], noWalls: true },

    // Turn left (z -94)
    { position: [3, 0, -94], size: [W + 6, H, W], noWalls: true },

    // Short normal stretch (z -97 to -101)
    { position: [0, 0, -99], size: [W, H, 4], noWalls: true },

    // Speed strip 4 into long jump (z -101 to -109)
    { position: [0, 0, -105], size: [W, H, 8], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, -1] },

    // Bounce pad for long jump (z -109 to -115)
    { position: [0, 0, -112], size: [W, H, 6], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Landing platform after long jump (z -123 to -129)
    { position: [0, 0, -126], size: [W, H, 6], noWalls: true },

    // Final speed strip to finish (z -129 to -135)
    { position: [0, 0, -132], size: [W, H, 6], noWalls: true, surfaceType: SurfaceType.Speed, direction: [0, 0, -1] },

    // Final bounce section (z -135 to -140)
    { position: [0, 0, -137.5], size: [W, H, 5], noWalls: true, surfaceType: SurfaceType.Bounce },

    // Finish platform (z -140 to -145)
    { position: [0, 0, -142.5], size: [W, H, 5], noWalls: true },
  ],
  bridges: [
    // Bridge over gap after long jump (z -115 to -123)
    {
      position: [0, 0, -119],
      width: 2.2,
      length: 8,
    },
    // Bridge connecting turn sections (z -62 area)
    {
      position: [6, 0, -65],
      width: 2.0,
      length: 4,
    },
  ],
  obstacles: [
    // SpeedBoost before first speed strip
    {
      position: [0, 0.75, -6],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Moving obstacle on first bounce section
    {
      position: [0, 0.75, -26],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2, speed: 2.5 },
    },
    // Stationary obstacle on normal platform
    {
      position: [1.5, 0.75, -34],
      size: [1, 1, 0.8],
      breakable: true,
    },
    // TimeBonus before second speed strip
    {
      position: [0, 0.75, -37],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
    // Moving obstacle on turn platform
    {
      position: [3, 0.75, -62],
      size: [1.5, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 3, speed: 3 },
    },
    // SpeedBoost before third speed strip
    {
      position: [6, 0.75, -67],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.SpeedBoost,
    },
    // Moving obstacle on landing after big bounce
    {
      position: [6, 0.75, -92],
      size: [1.2, 1, 0.8],
      breakable: true,
      moving: { axis: "x", range: 2.5, speed: 3.5 },
    },
    // TimeBonus before final long jump
    {
      position: [0, 0.75, -103],
      size: [1, 1, 1],
      breakable: true,
      powerUp: PowerUpType.TimeBonus,
    },
  ],
  latticeWalls: [
    {
      position: [0, 0.25, -32],
      width: W,
      height: 2,
      gapSide: "center",
      gapWidth: 2,
    },
    {
      position: [6, 0.25, -89],
      width: W,
      height: 2,
      gapSide: "left",
      gapWidth: 1.8,
    },
  ],
};
