import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.straight(8);
const s3 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2, offTime: 1.5 } });
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
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 2.0 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 2.0 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [6, 3, 10],
      direction: [0, 0, 1],
      strength: 12,
    },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
