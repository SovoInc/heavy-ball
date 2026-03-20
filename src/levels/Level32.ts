import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Magnet });
t.straight(6);
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.straight(6);
const s5 = t.lastCenter();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter();
t.straight(12);
const s8 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s10 = t.lastCenter();
const h10 = t.lastHeading();
const y10 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 32 — Magnet Maze",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0] + 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0], 0.75, s10[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 2.0 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "center", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
  timedGates: [
    { position: [s8[0], 0.25 + 1.25, s8[2]], size: [0.5, 2.5, 6], onTime: 2.5, offTime: 2 },
  ],
};

export default level;
