import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.straight(8);
const s3 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s5b = t.lastCenter();
const h5b = t.lastHeading();
const y5b = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s7b = t.lastCenter();
const h7b = t.lastHeading();
const y7b = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s9b = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s9c = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 75 — Invisible Inferno",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0] - 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s7[0] + 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9b[0], 0.75, s9b[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s9c[0], 0.75, s9c[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 1.5 },
    { position: [s7b[0], y7b, s7b[2]], width: 6, height: 2, rotation: h7b, gapSide: "right", gapWidth: 1.5 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [6, 3, 10],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s7b[0], s7b[1] + 1, s7b[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 16,
    },
    {
      position: [s9[0], s9[1] + 1, s9[2]],
      size: [10, 3, 6],
      direction: [0, 0, -1],
      strength: 13,
    },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
    { position: [s5b[0], 1.5, s5b[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
    { position: [s9b[0], 1.5, s9b[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
