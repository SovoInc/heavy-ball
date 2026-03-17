import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === THE FINAL TEST ===
// ~514 units, 12 curves, ALL 8 surface types, 2 teleport pairs,
// 8 lattice walls, 5 timed gates, 6 wind zones, 2 moving platforms,
// 3 bounce drops, 10 powerup boxes

// ── Tier 1: Opening gauntlet ────────────────────────────────────

t.straight(10);                                                               // safe start (Normal)
t.straight(14, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12);
const s3 = t.lastCenter();
t.straight(16, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2

// ── Tier 1 continued: Speed + first bounce drop ─────────────────

t.straight(14, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(10);
const s7 = t.lastCenter(); const y7 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 2 → heading 0

// ── Tier 2: Magnet + crumbling section ──────────────────────────

t.straight(14, { surfaceType: SurfaceType.Magnet });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(12);
const s11 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });

// Teleport pair 1: point A (optional shortcut from here to skip to section 5)
const tp1A = t.pos();
const tp1Ay = t.lastSurfaceY();

t.left(6);                                                                    // curve 3 → heading -π/2

// ── Tier 2 continued: Invisible + moving platform 1 ─────────────

t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(12);
const s15 = t.lastCenter(); const h15 = t.lastHeading(); const y15 = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s16 = t.lastCenter();
t.right(8);                                                                   // curve 4 → heading 0

t.straight(10);
const s18 = t.lastCenter();

// Moving platform 1: heading 0 → dx=0, dz=-1
t.z -= 2; // gap before
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 1.5, pause: 0.5 } });
t.z -= 2; // gap after

t.straight(12, { surfaceType: SurfaceType.Lava });
const s20 = t.lastCenter(); const h20 = t.lastHeading(); const y20 = t.lastSurfaceY();
t.right(8);                                                                   // curve 5 → heading π/2

// ── Tier 2 continued: Speed corridor + second bounce drop ───────

t.straight(16, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s22 = t.lastCenter(); const h22 = t.lastHeading(); const y22 = t.lastSurfaceY();
t.straight(12);
const s23 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 6 → heading 0

// ── Tier 3: Magnet + relief ─────────────────────────────────────

t.straight(14, { surfaceType: SurfaceType.Magnet });
const s26 = t.lastCenter(); const h26 = t.lastHeading(); const y26 = t.lastSurfaceY();
t.straight(12);
const s27 = t.lastCenter();

// Teleport pair 1: point B (destination of shortcut — skips tier 2)
const tp1B = t.pos();
const tp1By = t.lastSurfaceY();

t.straight(14, { surfaceType: SurfaceType.Ice });
const s28 = t.lastCenter();
t.left(6);                                                                    // curve 7 → heading -π/2

// ── Tier 3 continued: Crumbling + invisible ─────────────────────

t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(12);
const s31 = t.lastCenter(); const h31 = t.lastHeading(); const y31 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.right(8);                                                                   // curve 8 → heading 0

// ── Tier 3 continued: Lava + speed ──────────────────────────────

t.straight(14, { surfaceType: SurfaceType.Lava });
const s34 = t.lastCenter();
t.straight(12);
const s35 = t.lastCenter(); const h35 = t.lastHeading(); const y35 = t.lastSurfaceY();

// Teleport pair 2: point A (optional shortcut from here to near the end)
const tp2A = t.pos();
const tp2Ay = t.lastSurfaceY();

t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s36 = t.lastCenter();
t.right(8);                                                                   // curve 9 → heading π/2

// ── Tier 3: Moving platform 2 + third bounce drop ──────────────

t.straight(12);
const s38 = t.lastCenter();

// Moving platform 2: heading π/2 → dx=1, dz=0
t.x += 2; // gap before
t.straight(8, { platformMoving: { axis: [1, 0, 0], range: 2, speed: 2.0, pause: 0.3 } });
t.x += 2; // gap after

t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 10 → heading 0

// ── Tier 4: Final gauntlet ──────────────────────────────────────

t.straight(16, { surfaceType: SurfaceType.Ice });
const s42 = t.lastCenter(); const h42 = t.lastHeading(); const y42 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s43 = t.lastCenter();

// Teleport pair 2: point B (destination of shortcut)
const tp2B = t.pos();
const tp2By = t.lastSurfaceY();

t.left(6);                                                                    // curve 11 → heading -π/2

t.straight(14, { surfaceType: SurfaceType.Lava });
const s45 = t.lastCenter(); const h45 = t.lastHeading(); const y45 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s46 = t.lastCenter();
t.right(8);                                                                   // curve 12 → heading 0
t.straight(12);
t.straight(10);

// Total estimate:
// Straights: 10+14+12+16+14+10+10+14+12+10+10+12+14+10+4+8+4+12+16+12+10+14+12+14+10+12+10+14+12+14+12+4+8+4+10+16+12+14+10+12+10
// Curves: 12*12.6 (mix of r6 and r8) ~ 12*11 = 132
// Total ~ 514

const level: LevelData = {
  name: "Level 100 — The Final Test",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    // 10 breakable boxes with generous powerups
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s7[0], 0.75, s7[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s11[0] - 1, s11[1] + 0.5, s11[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s16[0], s16[1] + 0.5, s16[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s23[0] + 1, s23[1] + 0.5, s23[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s27[0] - 1, s27[1] + 0.5, s27[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s34[0] + 1, s34[1] + 0.5, s34[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s38[0], s38[1] + 0.5, s38[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s43[0] + 1, s43[1] + 0.5, s43[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s46[0], s46[1] + 0.5, s46[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    // 8 lattice walls, all tight gaps
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "center", gapWidth: 1.5 },
    { position: [s15[0], y15, s15[2]], width: 6, height: 2, rotation: h15, gapSide: "right", gapWidth: 1.5 },
    { position: [s22[0], y22, s22[2]], width: 6, height: 2, rotation: h22, gapSide: "left", gapWidth: 1.5 },
    { position: [s31[0], y31, s31[2]], width: 6, height: 2, rotation: h31, gapSide: "center", gapWidth: 1.5 },
    { position: [s42[0], y42, s42[2]], width: 6, height: 2, rotation: h42, gapSide: "right", gapWidth: 1.5 },
    { position: [s45[0], y45, s45[2]], width: 6, height: 2, rotation: h45, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    // 6 wind zones at varying strengths and directions
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 16],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s16[0], s16[1] + 1, s16[2]],
      size: [6, 3, 14],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s23[0], s23[1] + 1, s23[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 10,
    },
    {
      position: [s28[0], s28[1] + 1, s28[2]],
      size: [6, 3, 14],
      direction: [0, 0, -1],
      strength: 15,
    },
    {
      position: [s36[0], s36[1] + 1, s36[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s46[0], s46[1] + 1, s46[2]],
      size: [6, 3, 10],
      direction: [0, 0, 1],
      strength: 14,
    },
  ],
  timedGates: [
    // 5 timed gates
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s18[0], s18[1] + 1.25, s18[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s27[0], s27[1] + 1.25, s27[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 2.0 },
    { position: [s34[0], s34[1] + 1.25, s34[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
    { position: [s43[0], s43[1] + 1.25, s43[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
  ],
  teleportPairs: [
    // 2 teleport pairs (optional shortcuts that skip ~40% of track but miss powerups)
    { a: [tp1A[0], tp1Ay, tp1A[2]], b: [tp1B[0], tp1By, tp1B[2]] },
    { a: [tp2A[0], tp2Ay, tp2A[2]], b: [tp2B[0], tp2By, tp2B[2]] },
  ],
};

export default level;
