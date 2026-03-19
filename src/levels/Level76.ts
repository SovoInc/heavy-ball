import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s8b = t.lastCenter();
const h8b = t.lastHeading();
const y8b = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s8c = t.lastCenter();
t.right(6);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s8e = t.lastCenter();
const h8e = t.lastHeading();
const y8e = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 76 — Magnet Ice Slide",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8c[0] + 1, 0.75, s8c[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s8e[0], 0.75, s8e[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 1.5 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "center", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "right", gapWidth: 1.5 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "left", gapWidth: 1.5 },
    { position: [s8e[0], y8e, s8e[2]], width: 6, height: 2, rotation: h8e, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 10],
      direction: [1, 0, 0],
      strength: 14,
    },
    {
      position: [s8b[0], s8b[1] + 1, s8b[2]],
      size: [6, 3, 7],
      direction: [-1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s8b[0], 1.5, s8b[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s8c[0], 1.5, s8c[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
  ],
};

export default level;
