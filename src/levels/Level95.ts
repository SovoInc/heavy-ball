import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Dual-drop marathon, all surfaces ---

// Section 1: Opening
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Crumbling });
const s3 = t.lastCenter();

// Timed gate 1
const gate1 = t.lastCenter();

t.straight(7, { surfaceType: SurfaceType.Lava });
t.left(8);                                                                    // curve 1 → heading -π/2

// Section 2: First drop
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.right(8);                                                                   // curve 2 → heading 0

// Section 3: Crumbling + magnet
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();

// Timed gate 2
const gate2 = t.lastCenter();

t.right(8);                                                                   // curve 3 → heading π/2

// Section 4: Relief + invisible
t.straight(14, { surfaceType: SurfaceType.Ice });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 2 } });
const s14 = t.lastCenter(); const h14 = t.lastHeading(); const y14 = t.lastSurfaceY();

// Moving platform 1: heading π/2 → X-axis
t.x -= 2; // gap before (heading π/2 moves in +X)
t.straight(8, { platformMoving: { axis: [1, 0, 0], range: 2, speed: 1.5, pause: 0.5 } });
t.x -= 2; // gap after

t.left(8);                                                                    // curve 4 → heading 0

// Section 5: Second drop
t.straight(12, { surfaceType: SurfaceType.Ice });
const s16 = t.lastCenter(); const h16 = t.lastHeading(); const y16 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(6);                                                                    // curve 5 → heading -π/2

// Section 6: Speed corridor
t.straight(16, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s19 = t.lastCenter(); const h19 = t.lastHeading(); const y19 = t.lastSurfaceY();

// Timed gate 3
const gate3 = t.lastCenter();

t.straight(7, { surfaceType: SurfaceType.Lava });
const s20 = t.lastCenter();
t.right(8);                                                                   // curve 6 → heading 0

// Section 7: Final gauntlet
t.straight(14, { surfaceType: SurfaceType.Lava });
const s22 = t.lastCenter(); const h22 = t.lastHeading(); const y22 = t.lastSurfaceY();

// Timed gate 4
const gate4 = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Magnet });
const s23 = t.lastCenter(); const h23 = t.lastHeading(); const y23 = t.lastSurfaceY();
t.right(8);                                                                   // curve 7 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.straight(10);

const level: LevelData = {
  name: "Level 95 — Perdition's Edge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s9[0] + 1, s9[1] + 0.5, s9[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s13[0], s13[1] + 0.5, s13[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s16[0] - 1, s16[1] + 0.5, s16[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s20[0], s20[1] + 0.5, s20[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s23[0] + 1, s23[1] + 0.5, s23[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "center", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "center", gapWidth: 1.5 },
    { position: [s14[0], y14, s14[2]], width: 6, height: 2, rotation: h14, gapSide: "right", gapWidth: 1.5 },
    { position: [s19[0], y19, s19[2]], width: 6, height: 2, rotation: h19, gapSide: "left", gapWidth: 1.5 },
    { position: [s22[0], y22, s22[2]], width: 6, height: 2, rotation: h22, gapSide: "center", gapWidth: 1.5 },
    { position: [s23[0], y23, s23[2]], width: 6, height: 2, rotation: h23, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 14],
      direction: [0, 0, 1],
      strength: 15,
    },
    {
      position: [s16[0], s16[1] + 1, s16[2]],
      size: [6, 3, 12],
      direction: [1, 0, 0],
      strength: 16,
    },
    {
      position: [s22[0], s22[1] + 1, s22[2]],
      size: [6, 3, 14],
      direction: [-1, 0, 0],
      strength: 14,
    },
  ],
  timedGates: [
    { position: [gate1[0], 1.5, gate1[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [gate2[0], gate2[1] + 1.25, gate2[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 2.0 },
    { position: [gate3[0], gate3[1] + 1.25, gate3[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [gate4[0], gate4[1] + 1.25, gate4[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 2.0 },
  ],
};

export default level;
