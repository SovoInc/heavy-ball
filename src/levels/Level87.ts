import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.straight(10);
const s4 = t.lastCenter();
t.left(8);                                                                    // curve 1 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s6 = t.lastCenter();
t.straight(8);
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.right(8);                                                                   // curve 2 → heading 0
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.straight(7, { surfaceType: SurfaceType.Lava });
const s10b = t.lastCenter(); const h10b = t.lastHeading(); const y10b = t.lastSurfaceY();
t.right(6);                                                                   // curve 3 → heading π/2
t.straight(14);
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
const s12b = t.lastCenter(); const h12b = t.lastHeading(); const y12b = t.lastSurfaceY();
t.left(8);                                                                    // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s14 = t.lastCenter(); const h14 = t.lastHeading(); const y14 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s16 = t.lastCenter(); const h16 = t.lastHeading(); const y16 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 87 — Shattered Path",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0], s6[1] + 0.5, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s12[0], s12[1] + 0.5, s12[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s12b[0], s12b[1] + 0.5, s12b[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s14[0] - 1, s14[1] + 0.5, s14[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s16[0] + 1, s16[1] + 0.5, s16[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "right", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 1.5 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "center", gapWidth: 1.5 },
    { position: [s12b[0], y12b, s12b[2]], width: 6, height: 2, rotation: h12b, gapSide: "right", gapWidth: 1.5 },
    { position: [s16[0], y16, s16[2]], width: 6, height: 2, rotation: h16, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s10b[0], s10b[1] + 1, s10b[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 15,
    },
    {
      position: [s12b[0], s12b[1] + 1, s12b[2]],
      size: [10, 3, 6],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s16[0], s16[1] + 1, s16[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s10b[0], s10b[1] + 1.25, s10b[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s14[0], s14[1] + 1.25, s14[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
