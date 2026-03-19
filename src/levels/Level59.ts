import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                                  // safe start
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });      // speed heading 0
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });                                // ice after speed
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.left(6);                                                                       // curve 1
t.straight(7, { surfaceType: SurfaceType.Lava });                                // lava
const s5a = t.lastCenter();
t.straight(10);
const s5 = t.lastCenter(); const h5 = t.lastHeading(); const y5 = t.lastSurfaceY();
t.right(6);                                                                      // curve 2
t.straight(10, { surfaceType: SurfaceType.Crumbling });                          // crumbling
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s8 = t.lastCenter();
t.left(6);                                                                       // curve 3
t.straight(8, { surfaceType: SurfaceType.Magnet });                              // magnet
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.right(6);                                                                      // curve 4
t.straight(10);

const level: LevelData = {
  name: "Level 59 — Speed Ice Combo",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1.5, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s10[0], 0.75, s10[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2] + 3], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.8 },
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 1.7 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "center", gapWidth: 1.6 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "right", gapWidth: 1.7 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 12],
      direction: [1, 0, 0],
      strength: 14,
    },
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 6],
      direction: [0, 0, -1],
      strength: 12,
    },
  ],
};

export default level;
