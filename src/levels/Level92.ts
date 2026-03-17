import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Section 1: Opening descent ---
t.straight(10);                                                               // safe start
t.straight(12);
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.right(8);                                                                   // curve 1 → heading π/2

// --- Section 2: Lava run ---
t.straight(14);
const s6 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.straight(10);
const s8 = t.lastCenter();
t.left(8);                                                                    // curve 2 → heading 0

// --- Section 3: Second drop ---
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s10 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.right(6);                                                                   // curve 3 → heading π/2

// --- Section 4: Magnet maze ---
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(10);
const s14 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Crumbling });
t.left(8);                                                                    // curve 4 → heading 0

// --- Section 5: Invisible + third drop ---
t.straight(10);
const s17 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s18 = t.lastCenter(); const h18 = t.lastHeading(); const y18 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(6);                                                                    // curve 5 → heading -π/2

// --- Section 6: Speed corridor ---
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s21 = t.lastCenter(); const h21 = t.lastHeading(); const y21 = t.lastSurfaceY();
t.right(8);                                                                   // curve 6 → heading 0

// --- Section 7: Final gauntlet ---
t.straight(12);
const s23 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Ice });
t.right(8);                                                                   // curve 7 → heading π/2
t.straight(10);
t.straight(10);

// ~10+12+10+8+12.6+14+12+10+12.6+14+8+9.4+12+10+14+12.6+10+12+8+9.4+14+12.6+12+10+12.6+10+10 = ~321.8

const level: LevelData = {
  name: "Level 92 — Descent into Madness",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s6[0], s6[1] + 0.5, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s8[0], s8[1] + 0.5, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s14[0], s14[1] + 0.5, s14[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s17[0] - 1, s17[1] + 0.5, s17[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s23[0] + 1, s23[1] + 0.5, s23[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.8 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "right", gapWidth: 1.5 },
    { position: [s18[0], y18, s18[2]], width: 6, height: 2, rotation: h18, gapSide: "center", gapWidth: 1.5 },
    { position: [s21[0], y21, s21[2]], width: 6, height: 2, rotation: h21, gapSide: "left", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s23[0], s23[1] + 1, s23[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 10,
    },
  ],
};

export default level;
