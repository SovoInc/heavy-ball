import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(10);
const s3 = t.lastCenter();
t.left(8);                                                                    // curve 1 → heading -π/2
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s5 = t.lastCenter(); const h5 = t.lastHeading(); const y5 = t.lastSurfaceY();
t.straight(8);
const s6 = t.lastCenter();
t.right(8);                                                                   // curve 2 → heading 0
t.straight(12);
const s8 = t.lastCenter();
t.right(8);                                                                   // curve 3 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(10);
const s11 = t.lastCenter();
t.left(8);                                                                    // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(10);

// ~10+12+10+12.6+14+8+12.6+12+12.6+14+10+12.6+12+10 = ~172.4

const level: LevelData = {
  name: "Level 84 — Conveyor Chaos",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s11[0], 0.75, s11[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.5 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "right", gapWidth: 1.5 },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s8[0], 1.5, s8[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 2.0 },
    { position: [s11[0], 1.5, s11[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
