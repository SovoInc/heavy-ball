import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Speed-focused marathon ---

// Section 1: Opening
t.straight(10);                                                               // safe start
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s3 = t.lastCenter();

// Timed gate 1
const gate1 = t.lastCenter();

t.right(8);                                                                   // curve 1 → heading π/2

// Section 2
t.straight(16, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s5 = t.lastCenter(); const h5 = t.lastHeading(); const y5 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
t.left(8);                                                                    // curve 2 → heading 0

// Section 3: Relief
t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();

// Timed gate 2
const gate2 = t.lastCenter();

t.left(6);                                                                    // curve 3 → heading -π/2

// Section 4
t.straight(16, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s13 = t.lastCenter();

// Moving platform 1: heading -π/2 → X-axis
t.x += 2; // gap before (heading -π/2 moves in -X direction)
t.straight(8, { platformMoving: { axis: [1, 0, 0], range: 2, speed: 1.5, pause: 0.5 } });
t.x += 2; // gap after

t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.right(8);                                                                   // curve 4 → heading 0

// Section 5
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s15 = t.lastCenter(); const h15 = t.lastHeading(); const y15 = t.lastSurfaceY();

// Timed gate 3
const gate3 = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Magnet });
const s16 = t.lastCenter(); const h16 = t.lastHeading(); const y16 = t.lastSurfaceY();
t.right(8);                                                                   // curve 5 → heading π/2

// Section 6
t.straight(7, { surfaceType: SurfaceType.Lava });
const s18 = t.lastCenter(); const h18 = t.lastHeading(); const y18 = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s19 = t.lastCenter(); const h19 = t.lastHeading(); const y19 = t.lastSurfaceY();

// Timed gate 4
const gate4 = t.lastCenter();

t.left(8);                                                                    // curve 6 → heading 0

// Section 7: Final sprint
t.straight(16, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s21 = t.lastCenter(); const h21 = t.lastHeading(); const y21 = t.lastSurfaceY();
t.left(6);                                                                    // curve 7 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(10);

const level: LevelData = {
  name: "Level 94 — Twilight Express",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0] - 1, 0.75, s9[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s13[0], 0.75, s13[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s18[0], 0.75, s18[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s19[0], 0.75, s19[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.5 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "right", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "right", gapWidth: 1.5 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "center", gapWidth: 1.5 },
    { position: [s16[0], y16, s16[2]], width: 6, height: 2, rotation: h16, gapSide: "left", gapWidth: 1.5 },
    { position: [s19[0], y19, s19[2]], width: 6, height: 2, rotation: h19, gapSide: "right", gapWidth: 1.5 },
    { position: [s21[0], y21, s21[2]], width: 6, height: 2, rotation: h21, gapSide: "center", gapWidth: 1.5 },
  ],
  timedGates: [
    { position: [gate1[0], 1.5, gate1[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [gate2[0], gate2[1] + 1.25, gate2[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [gate3[0], gate3[1] + 1.25, gate3[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [gate4[0], gate4[1] + 1.25, gate4[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 10],
      direction: [0, 0, -1],
      strength: 15,
    },
    {
      position: [s13[0], s13[1] + 1, s13[2]],
      size: [6, 3, 12],
      direction: [1, 0, 0],
      strength: 16,
    },
    {
      position: [s18[0], s18[1] + 1, s18[2]],
      size: [6, 3, 7],
      direction: [0, 0, 1],
      strength: 14,
    },
  ],
};

export default level;
