import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                                        // safe start
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } }); // invisible 1
t.left(6);                                                                             // curve 1
t.straight(6);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.0, offTime: 1.5 } }); // invisible 2
t.right(6);                                                                            // curve 2
t.straight(7, { surfaceType: SurfaceType.Lava });                                      // lava
const s6a = t.lastCenter(); const h6a = t.lastHeading(); const y6a = t.lastSurfaceY();
t.straight(6);
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } }); // invisible 3
t.left(6);                                                                             // curve 3
t.straight(10, { surfaceType: SurfaceType.Ice });                                      // ice
const s8a = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.0, offTime: 1.5 } }); // invisible 4
t.right(6);                                                                            // curve 4
t.straight(8, { surfaceType: SurfaceType.Crumbling });                                 // crumbling
const s10 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Magnet });                                    // magnet
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 56 — Invisible Bridge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] + 1, 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s10[0] + 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "right", gapWidth: 1.8 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.7 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "center", gapWidth: 1.6 },
  ],
  windZones: [
    {
      position: [s8a[0], s8a[1] + 1, s8a[2]],
      size: [6, 3, 10],
      direction: [0, 0, 1],
      strength: 12,
    },
    {
      position: [s6a[0], s6a[1] + 1, s6a[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
