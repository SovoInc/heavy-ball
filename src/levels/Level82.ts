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
t.right(8);                                                                   // curve 3 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(10);
const s11 = t.lastCenter();
t.left(8);                                                                    // curve 4 → heading 0
t.straight(12);
const s13 = t.lastCenter();
t.straight(10);

// ~10+14+12.6+12+14+12.6+10+12+12.6+14+10+12.6+12+10 = ~168.4

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
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "left", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 1.8 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "center", gapWidth: 1.5 },
  ],
};

export default level;
