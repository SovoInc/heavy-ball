import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(8);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s5 = t.lastCenter();
t.straight(10);
const s6 = t.lastCenter();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s8 = t.lastCenter(); const h8 = t.lastHeading(); const y8 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(14);
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(10);
const s14 = t.lastCenter();
t.straight(10);

// ~10+10+8+12.6+12+10+12.6+10+12+9.4+14+12.6+12+10+10 = ~185.2

const level: LevelData = {
  name: "Level 88 — Ghost Bridge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s14[0] + 1, 0.75, s14[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 1.5 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "right", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "center", gapWidth: 1.8 },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
    { position: [s6[0], 1.5, s6[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
    { position: [s14[0], 1.5, s14[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
