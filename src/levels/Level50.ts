import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(12, { surfaceType: SurfaceType.Ice });        // ice section
const s2 = t.lastCenter();
t.straight(10);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.left(6);                                               // curve 1
t.straight(7, { surfaceType: SurfaceType.Lava });        // lava section (max 7)
const s5 = t.lastCenter();
t.right(6);                                              // curve 2
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s7 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(10);

const level: LevelData = {
  name: "Level 50 — Ice and Fire",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7[0] + 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 2.0 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "right", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [7, 3, 6],
      direction: [1, 0, 0],
      strength: 12,
    },
  ],
  timedGates: [
    { position: [s7[0], 0.25 + 1.25, s7[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2 },
  ],
};

export default level;
