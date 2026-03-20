import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Section 1: Opening descent ---
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.right(8);                                                                   // curve 1 → heading π/2

// --- Section 2: Lava run ---
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();

// Timed gate 1
const gate1 = t.lastCenter();

t.straight(7, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
const s8 = t.lastCenter();
t.left(8);                                                                    // curve 2 → heading 0

// --- Section 3: Second drop ---
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.right(6);                                                                   // curve 3 → heading π/2

// --- Section 4: Magnet maze ---
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();

// Timed gate 2
const gate2 = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Lava });
const s14 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s15 = t.lastCenter(); const h15 = t.lastHeading(); const y15 = t.lastSurfaceY();
t.left(8);                                                                    // curve 4 → heading 0

// --- Section 5: Invisible + third drop ---
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 2 } });
const s17 = t.lastCenter();

// Moving platform 1: heading 0 → Z-axis
t.z -= 2; // gap before
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 1.5, pause: 0.5 } });
t.z -= 2; // gap after

t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s18 = t.lastCenter(); const h18 = t.lastHeading(); const y18 = t.lastSurfaceY();

// Timed gate 3
const gate3 = t.lastCenter();

t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(6);                                                                    // curve 5 → heading -π/2

// --- Section 6: Speed corridor ---
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s21 = t.lastCenter(); const h21 = t.lastHeading(); const y21 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s22 = t.lastCenter();
t.right(8);                                                                   // curve 6 → heading 0

// --- Section 7: Final gauntlet ---
t.straight(12, { surfaceType: SurfaceType.Ice });
const s23 = t.lastCenter(); const h23 = t.lastHeading(); const y23 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.right(8);                                                                   // curve 7 → heading π/2
t.straight(10, { surfaceType: SurfaceType.Magnet });
t.straight(10);

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
    { position: [s22[0], s22[1] + 0.5, s22[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s23[0] + 1, s23[1] + 0.5, s23[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "right", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "right", gapWidth: 1.5 },
    { position: [s15[0], y15, s15[2]], width: 6, height: 2, rotation: h15, gapSide: "left", gapWidth: 1.5 },
    { position: [s18[0], y18, s18[2]], width: 6, height: 2, rotation: h18, gapSide: "center", gapWidth: 1.5 },
    { position: [s21[0], y21, s21[2]], width: 6, height: 2, rotation: h21, gapSide: "left", gapWidth: 1.5 },
    { position: [s23[0], y23, s23[2]], width: 6, height: 2, rotation: h23, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 15,
    },
    {
      position: [s14[0], s14[1] + 1, s14[2]],
      size: [6, 3, 10],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s23[0], s23[1] + 1, s23[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [gate1[0], gate1[1] + 1.25, gate1[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [gate2[0], gate2[1] + 1.25, gate2[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
    { position: [gate3[0], gate3[1] + 1.25, gate3[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
