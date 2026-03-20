import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(10, { surfaceType: SurfaceType.Bounce });     // bounce section
t.straight(7, { surfaceType: SurfaceType.Lava });        // lava section (capped at 7)
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Ice });         // ice after lava
const s3a = t.lastCenter();
t.left(6);                                               // curve 1
t.straight(10);
const s5 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Bounce });      // bounce 2
t.right(6);                                              // curve 2
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling
const s8 = t.lastCenter(); const h8 = t.lastHeading(); const y8 = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
const s9 = t.lastCenter();
t.left(6);                                               // curve 3
t.straight(7, { surfaceType: SurfaceType.Lava });        // second lava
const s11 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });      // magnet
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.right(6);                                              // curve 4
t.straight(10);

const level: LevelData = {
  name: "Level 58 — Bounce and Burn",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5[0] - 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0] + 1, 0.75, s5[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s11[0], 0.75, s11[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 1.8 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "right", gapWidth: 1.7 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "left", gapWidth: 1.6 },
  ],
  windZones: [
    {
      position: [s3a[0], s3a[1] + 1, s3a[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s9[0], s9[1] + 1, s9[2]],
      size: [6, 3, 6],
      direction: [0, 0, 1],
      strength: 10,
    },
  ],
};

export default level;
