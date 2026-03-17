import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const y2 = t.lastSurfaceY();
t.straight(10);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(14);
const s5 = t.lastCenter(); const y5 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Lava });
const s6 = t.lastCenter();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(12);
const s8 = t.lastCenter(); const h8 = t.lastHeading(); const y8 = t.lastSurfaceY();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s10 = t.lastCenter();
t.straight(10);
const s11 = t.lastCenter(); const y11 = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.right(8);                                                                   // curve 5 → heading π/2
t.straight(14);
const s15 = t.lastCenter(); const y15 = t.lastSurfaceY();
t.straight(10);

// ~10+12+10+12.6+14+10+12.6+12+9.4+14+10+12.6+12+12.6+14+10 = ~197.8

const level: LevelData = {
  name: "Level 89 — Warp Zone",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s10[0], 0.75, s10[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "right", gapWidth: 1.5 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "left", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "center", gapWidth: 1.8 },
  ],
  teleportPairs: [
    { a: [s2[0], y2, s2[2]], b: [s5[0], y5, s5[2]] },
    { a: [s11[0], y11, s11[2]], b: [s15[0], y15, s15[2]] },
  ],
};

export default level;
