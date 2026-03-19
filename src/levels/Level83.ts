import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(8);
const s3 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12);
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s6b = t.lastCenter(); const h6b = t.lastHeading(); const y6b = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s10 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s10b = t.lastCenter(); const h10b = t.lastHeading(); const y10b = t.lastSurfaceY();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.straight(8);
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.straight(12, { surfaceType: SurfaceType.Ice });
const s16 = t.lastCenter(); const h16 = t.lastHeading(); const y16 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s16b = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s16c = t.lastCenter(); const h16c = t.lastHeading(); const y16c = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 83 — Blackout Run",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0], s6[1] + 0.5, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0] + 1, s10[1] + 0.5, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s13[0], s13[1] + 0.5, s13[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s16[0] - 1, s16[1] + 0.5, s16[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s16b[0] + 1, s16b[1] + 0.5, s16b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s6b[0], y6b, s6b[2]], width: 6, height: 2, rotation: h6b, gapSide: "right", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "right", gapWidth: 1.5 },
    { position: [s16[0], y16, s16[2]], width: 6, height: 2, rotation: h16, gapSide: "center", gapWidth: 1.5 },
    { position: [s16c[0], y16c, s16c[2]], width: 6, height: 2, rotation: h16c, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s6b[0], s6b[1] + 1, s6b[2]],
      size: [10, 3, 6],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [12, 3, 6],
      direction: [0, 0, 1],
      strength: 15,
    },
    {
      position: [s16c[0], s16c[1] + 1, s16c[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s10b[0], s10b[1] + 1.25, s10b[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s16b[0], s16b[1] + 1.25, s16b[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
