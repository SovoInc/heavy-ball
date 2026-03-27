import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === THE FINAL TEST ===
// ~514 units, 12 curves, ALL 8 surface types, 2 teleport pairs (mandatory bridges),
// 10 lattice walls, 6 timed gates, 7 wind zones, 2 moving platforms,
// 3 bounce drops, 10 powerup boxes — split into 3 disconnected sections

// ═══════════════════════════════════════════════════════════════════
// === Section 1 (~170 units, 4 curves): Normal, Ice, Lava, bounce drop
// ═══════════════════════════════════════════════════════════════════

t.straight(10);                                                               // safe start (Normal)
t.straight(14, { surfaceType: SurfaceType.Ice });
const s1_ice = t.lastCenter(); const h1_ice = t.lastHeading(); const y1_ice = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s1_3 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s1_lava = t.lastCenter(); const h1_lava = t.lastHeading(); const y1_lava = t.lastSurfaceY();

// Timed gate 1
const gate1 = t.lastCenter();

t.right(8);                                                                   // curve 1 → heading π/2

t.straight(14, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s1_speed = t.lastCenter(); const h1_speed = t.lastHeading(); const y1_speed = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s1_7 = t.lastCenter(); const h1_7 = t.lastHeading(); const y1_7 = t.lastSurfaceY();

// Timed gate 2
const gate2_a = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 2 → heading 0

t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s1_10 = t.lastCenter(); const h1_10 = t.lastHeading(); const y1_10 = t.lastSurfaceY();

// Moving platform 1: heading 0 → Z-axis
t.z -= 2; // gap before
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 1.5, pause: 0.5 } });
t.z -= 2; // gap after

t.straight(7, { surfaceType: SurfaceType.Lava });
const s1_lava2 = t.lastCenter(); const h1_lava2 = t.lastHeading(); const y1_lava2 = t.lastSurfaceY();

// Timed gate 3
const gate2 = t.lastCenter();

t.right(8);                                                                   // curve 3 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Ice });
const s1_14 = t.lastCenter(); const h1_14 = t.lastHeading(); const y1_14 = t.lastSurfaceY();
t.left(8);                                                                    // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// ═══════════════════════════════════════════════════════════════════
// === Section 2 (~170 units, 4 curves): Speed, Crumbling, Magnet, bounce drop
// ═══════════════════════════════════════════════════════════════════

t.x = 200; t.z = 200; t.y = 0; t.heading = 0;

t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2_speed = t.lastCenter(); const h2_speed = t.lastHeading(); const y2_speed = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s2_3 = t.lastCenter(); const h2_3 = t.lastHeading(); const y2_3 = t.lastSurfaceY();

// Timed gate 4
const gate3 = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.right(8);                                                                   // curve 5 → heading π/2

t.straight(7, { surfaceType: SurfaceType.Lava });
const s2_mag = t.lastCenter(); const h2_mag = t.lastHeading(); const y2_mag = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2_7 = t.lastCenter(); const h2_7 = t.lastHeading(); const y2_7 = t.lastSurfaceY();

// Timed gate 5
const gate4 = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 6 → heading 0

t.straight(14, { surfaceType: SurfaceType.Ice });
const s2_ice = t.lastCenter(); const h2_ice = t.lastHeading(); const y2_ice = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s2_11 = t.lastCenter(); const h2_11 = t.lastHeading(); const y2_11 = t.lastSurfaceY();
t.left(6);                                                                    // curve 7 → heading -π/2

t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s2_13 = t.lastCenter(); const h2_13 = t.lastHeading(); const y2_13 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s2_lava = t.lastCenter();
t.right(8);                                                                   // curve 8 → heading 0

t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.straight(10);                                                               // telepad 2A here
const tp2A = t.lastCenter(); const y2A = t.lastSurfaceY();

// ═══════════════════════════════════════════════════════════════════
// === Section 3 (~170 units, 4 curves): Invisible, all hazard mix, bounce drop
// ═══════════════════════════════════════════════════════════════════

t.x = 400; t.z = 400; t.y = 0; t.heading = 0;

t.straight(10);                                                               // telepad 2B here
const tp2B = t.lastCenter(); const y2B = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
const s3_invis = t.lastCenter(); const h3_invis = t.lastHeading(); const y3_invis = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s3_mag = t.lastCenter(); const h3_mag = t.lastHeading(); const y3_mag = t.lastSurfaceY();
t.right(8);                                                                   // curve 9 → heading π/2

t.straight(7, { surfaceType: SurfaceType.Lava });
const s3_lava = t.lastCenter(); const h3_lava = t.lastHeading(); const y3_lava = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s3_5 = t.lastCenter();

// Timed gate 6
const gate5 = t.lastCenter();

t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 10 → heading 0

t.straight(14, { surfaceType: SurfaceType.Ice });
const s3_ice = t.lastCenter(); const h3_ice = t.lastHeading(); const y3_ice = t.lastSurfaceY();

// Moving platform 2: heading 0 → Z-axis
t.z -= 1; // gap before
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 1, speed: 2.0, pause: 0.5 } });
t.z -= 1; // gap after

t.straight(12, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s3_speed = t.lastCenter(); const h3_speed = t.lastHeading(); const y3_speed = t.lastSurfaceY();
t.left(6);                                                                    // curve 11 → heading -π/2

t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s3_crumb = t.lastCenter(); const h3_crumb = t.lastHeading(); const y3_crumb = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s3_12 = t.lastCenter();
t.right(8);                                                                   // curve 12 → heading 0

t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2 } });
t.straight(10);                                                               // finish

const level: LevelData = {
  name: "Level 100 — The Final Test",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    // 10 breakable boxes: 2 Shield, 2 TimeFreeze, 3 TimeBonus, 3 SpeedBoost
    // Section 1 (4 boxes)
    { position: [s1_3[0] + 1, 0.75, s1_3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s1_7[0], 0.75, s1_7[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s1_10[0] - 1, s1_10[1] + 0.5, s1_10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s1_14[0], 0.75, s1_14[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    // Section 2 (3 boxes — after drop, use s[1]+0.5 for Y)
    { position: [s2_3[0] + 1, 0.75, s2_3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s2_ice[0] - 1, s2_ice[1] + 0.5, s2_ice[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2_13[0], 0.75, s2_13[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    // Section 3 (3 boxes — y reset, after drop use s[1]+0.5)
    { position: [s3_5[0], 0.75, s3_5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s3_ice[0] + 1, s3_ice[1] + 0.5, s3_ice[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s3_12[0], s3_12[1] + 0.5, s3_12[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    // 10 lattice walls (all gap 1.5): 4 in sec 1, 3 in sec 2, 3 in sec 3
    { position: [s1_ice[0], y1_ice, s1_ice[2]], width: 6, height: 2, rotation: h1_ice, gapSide: "right", gapWidth: 1.5 },
    { position: [s1_speed[0], y1_speed, s1_speed[2]], width: 6, height: 2, rotation: h1_speed, gapSide: "left", gapWidth: 1.5 },
    { position: [s1_lava2[0], y1_lava2, s1_lava2[2]], width: 6, height: 2, rotation: h1_lava2, gapSide: "center", gapWidth: 1.5 },
    { position: [s1_14[0], y1_14, s1_14[2]], width: 6, height: 2, rotation: h1_14, gapSide: "right", gapWidth: 1.5 },
    { position: [s2_mag[0], y2_mag, s2_mag[2]], width: 6, height: 2, rotation: h2_mag, gapSide: "right", gapWidth: 1.5 },
    { position: [s2_7[0], y2_7, s2_7[2]], width: 6, height: 2, rotation: h2_7, gapSide: "left", gapWidth: 1.5 },
    { position: [s2_11[0], y2_11, s2_11[2]], width: 6, height: 2, rotation: h2_11, gapSide: "center", gapWidth: 1.5 },
    { position: [s3_invis[0], y3_invis, s3_invis[2]], width: 6, height: 2, rotation: h3_invis, gapSide: "right", gapWidth: 1.5 },
    { position: [s3_mag[0], y3_mag, s3_mag[2]], width: 6, height: 2, rotation: h3_mag, gapSide: "left", gapWidth: 1.5 },
    { position: [s3_crumb[0], y3_crumb, s3_crumb[2]], width: 6, height: 2, rotation: h3_crumb, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    // 7 wind zones: 2 in sec 1, 3 in sec 2, 2 in sec 3
    // Section 1
    {
      position: [s1_lava[0], s1_lava[1] + 1, s1_lava[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 15,
    },
    {
      position: [s1_lava2[0], s1_lava2[1] + 1, s1_lava2[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 16,
    },
    // Section 2
    {
      position: [s2_speed[0], s2_speed[1] + 1, s2_speed[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 14,
    },
    {
      position: [s2_lava[0], s2_lava[1] + 1, s2_lava[2]],
      size: [10, 3, 6],
      direction: [0, 0, -1],
      strength: 18,
    },
    {
      position: [s2_13[0], s2_13[1] + 1, s2_13[2]],
      size: [6, 3, 14],
      direction: [-1, 0, 0],
      strength: 15,
    },
    // Section 3
    {
      position: [s3_lava[0], s3_lava[1] + 1, s3_lava[2]],
      size: [14, 3, 6],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s3_speed[0], s3_speed[1] + 1, s3_speed[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    // 6 timed gates: 3 in sec 1, 2 in sec 2, 1 in sec 3
    { position: [gate1[0], 1.5, gate1[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [gate2_a[0], gate2_a[1] + 1.25, gate2_a[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [gate2[0], gate2[1] + 1.25, gate2[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [gate3[0], 1.5, gate3[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 2.0 },
    { position: [gate4[0], gate4[1] + 1.25, gate4[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
    { position: [gate5[0], 1.5, gate5[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
};

export default level;
