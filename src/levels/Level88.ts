import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 2 } });
t.straight(8);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 1.5 } });
const s5 = t.lastCenter();
t.straight(10);
const s6 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s6b = t.lastCenter(); const h6b = t.lastHeading(); const y6b = t.lastSurfaceY();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s8 = t.lastCenter(); const h8 = t.lastHeading(); const y8 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
const s9b = t.lastCenter(); const h9b = t.lastHeading(); const y9b = t.lastSurfaceY();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(14);
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s11b = t.lastCenter();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(10);
const s14 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s14b = t.lastCenter(); const h14b = t.lastHeading(); const y14b = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 88 — Ghost Bridge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s14[0] + 1, 0.75, s14[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s11b[0], 0.75, s11b[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s9b[0] - 1, 0.75, s9b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 1.5 },
    { position: [s6b[0], y6b, s6b[2]], width: 6, height: 2, rotation: h6b, gapSide: "right", gapWidth: 1.5 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "right", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "center", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s6b[0], s6b[1] + 1, s6b[2]],
      size: [7, 3, 6],
      direction: [0, 0, 1],
      strength: 15,
    },
    {
      position: [s9[0], s9[1] + 1, s9[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 14,
    },
    {
      position: [s14b[0], s14b[1] + 1, s14b[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
    { position: [s6[0], 1.5, s6[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
    { position: [s14[0], 1.5, s14[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
