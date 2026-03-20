import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.left(8);                                                                    // curve 1 → heading -π/2
t.straight(12);
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s5 = t.lastCenter();
t.right(8);                                                                   // curve 2 → heading 0
t.straight(10);
const s7 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s8 = t.lastCenter(); const h8 = t.lastHeading(); const y8 = t.lastSurfaceY();
t.right(8);                                                                   // curve 3 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(10);
const s11 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s11b = t.lastCenter(); const h11b = t.lastHeading(); const y11b = t.lastSurfaceY();
t.left(8);                                                                    // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s13b = t.lastCenter(); const h13b = t.lastHeading(); const y13b = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s13c = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 82 — Magnet Trap",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0] + 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s11[0], 0.75, s11[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s13[0] - 1, 0.75, s13[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s13c[0], 0.75, s13c[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "left", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "center", gapWidth: 1.5 },
    { position: [s11b[0], y11b, s11b[2]], width: 6, height: 2, rotation: h11b, gapSide: "left", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [14, 3, 6],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s11b[0], s11b[1] + 1, s11b[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 16,
    },
    {
      position: [s13b[0], s13b[1] + 1, s13b[2]],
      size: [6, 3, 10],
      direction: [1, 0, 0],
      strength: 15,
    },
  ],
  timedGates: [
    { position: [s7[0], 1.5, s7[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s13[0], 1.5, s13[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
  ],
};

export default level;
