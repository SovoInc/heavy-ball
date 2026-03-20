import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Inferno Spiral: spiraling fire/ice descent ---

// Section 1: Opening
t.straight(10);                                                               // safe start
t.straight(14, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s3 = t.lastCenter();

// Timed gate 1
const gate1 = t.lastCenter();

t.straight(7, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2

// Section 2: Spiral arm 1
t.straight(14, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();

// Timed gate 2
const gate2 = t.lastCenter();

t.straight(7, { surfaceType: SurfaceType.Lava });
t.right(8);                                                                   // curve 2 → heading π
t.drop(-2);

// Section 3: Spiral arm 2
t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Speed, direction: [0, 0, 1] });
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
t.right(8);                                                                   // curve 3 → heading -π/2
t.drop(-2);

// Section 4: Spiral arm 3
t.straight(7, { surfaceType: SurfaceType.Lava });
const s14 = t.lastCenter(); const h14 = t.lastHeading(); const y14 = t.lastSurfaceY();

// Timed gate 3
const gate3 = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s15 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s16 = t.lastCenter(); const h16 = t.lastHeading(); const y16 = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading 0
t.drop(-2);

// Section 5: Spiral arm 4
t.straight(12, { surfaceType: SurfaceType.Ice });
const s18 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s20 = t.lastCenter(); const h20 = t.lastHeading(); const y20 = t.lastSurfaceY();

// Timed gate 4
const gate4 = t.lastCenter();

t.left(8);                                                                    // curve 5 → heading -π/2

// Section 6: Escape corridor
t.straight(16, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s22 = t.lastCenter(); const h22 = t.lastHeading(); const y22 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s23 = t.lastCenter();
t.right(8);                                                                   // curve 6 → heading 0

// Section 7: Ice gauntlet
t.straight(14, { surfaceType: SurfaceType.Ice });
const s25 = t.lastCenter(); const h25 = t.lastHeading(); const y25 = t.lastSurfaceY();

// Moving platform 1: heading 0 → Z-axis
t.z -= 2; // gap before
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 2.0, pause: 0.5 } });
t.z -= 2; // gap after

t.straight(7, { surfaceType: SurfaceType.Lava });
const s26 = t.lastCenter(); const h26 = t.lastHeading(); const y26 = t.lastSurfaceY();
t.left(6);                                                                    // curve 7 → heading -π/2

// Section 8: Crumbling + invisible
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 2 } });
const s28 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s29 = t.lastCenter(); const h29 = t.lastHeading(); const y29 = t.lastSurfaceY();
t.right(8);                                                                   // curve 8 → heading 0

// Section 9: Final blaze
t.straight(14, { surfaceType: SurfaceType.Bounce });
t.right(8);                                                                   // curve 9 → heading π/2
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(8);

const level: LevelData = {
  name: "Level 96 — Inferno Spiral",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s10[0] + 1, s10[1] + 0.5, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s15[0], s15[1] + 0.5, s15[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s18[0] - 1, s18[1] + 0.5, s18[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s23[0], s23[1] + 0.5, s23[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s28[0], s28[1] + 0.5, s28[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "right", gapWidth: 1.5 },
    { position: [s14[0], y14, s14[2]], width: 6, height: 2, rotation: h14, gapSide: "left", gapWidth: 1.5 },
    { position: [s16[0], y16, s16[2]], width: 6, height: 2, rotation: h16, gapSide: "center", gapWidth: 1.5 },
    { position: [s22[0], y22, s22[2]], width: 6, height: 2, rotation: h22, gapSide: "right", gapWidth: 1.5 },
    { position: [s25[0], y25, s25[2]], width: 6, height: 2, rotation: h25, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 14],
      direction: [0, 0, -1],
      strength: 15,
    },
    {
      position: [s15[0], s15[1] + 1, s15[2]],
      size: [6, 3, 10],
      direction: [1, 0, 0],
      strength: 16,
    },
    {
      position: [s23[0], s23[1] + 1, s23[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s28[0], s28[1] + 1, s28[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 18,
    },
  ],
  timedGates: [
    { position: [gate1[0], 1.5, gate1[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [gate2[0], gate2[1] + 1.25, gate2[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [gate3[0], gate3[1] + 1.25, gate3[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
    { position: [gate4[0], gate4[1] + 1.25, gate4[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
