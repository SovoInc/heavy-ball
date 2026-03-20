import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 1
const g1 = t.lastCenter();
t.straight(8);
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.left(6);                                               // curve 1
t.straight(7, { surfaceType: SurfaceType.Lava });        // lava
const s5 = t.lastCenter();
t.straight(10);
const g2 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 2
t.right(6);                                              // curve 2
t.straight(8, { surfaceType: SurfaceType.Ice });         // ice
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
const s10 = t.lastCenter();
t.left(6);                                               // curve 3
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s12 = t.lastCenter();
t.right(6);                                              // curve 4
t.straight(10);

const level: LevelData = {
  name: "Level 54 — Crumble Gate",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3[0] - 1, 0.75, s3[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [g2[0], 0.75, g2[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s12[0], 0.75, s12[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "right", gapWidth: 1.7 },
  ],
  timedGates: [
    { position: [g1[0], 1.5, g1[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2.0 },
    { position: [g2[0], 1.5, g2[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
  ],
  windZones: [
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 6],
      direction: [-1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
