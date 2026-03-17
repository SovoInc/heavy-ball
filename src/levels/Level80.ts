import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~40 units): Ice, Lava, wind, 2 boxes ===
t.straight(10);                                                               // safe start
t.straight(8, { surfaceType: SurfaceType.Ice });
const s1_2 = t.lastCenter();
t.left(6);                                                                    // curve → heading -π/2
t.straight(10);
const w1 = t.lastCenter(); const hw1 = t.lastHeading(); const yw1 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Lava });
const lava1 = t.lastCenter();
t.right(6);                                                                   // curve → heading 0
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// === Jump to section 2 ===
t.x = 100; t.z = 200; t.y = 0; t.heading = 0;

// === Section 2 (~42 units): Bounce, drop, Crumbling, Speed, Magnet, wind, 2 boxes ===
t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-6);
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s2_3 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2_4 = t.lastCenter();
t.left(6);                                                                    // curve → heading -π/2
t.straight(8, { surfaceType: SurfaceType.Magnet });
const magnet1 = t.lastCenter();
const w2 = t.lastCenter(); const hw2 = t.lastHeading(); const yw2 = t.lastSurfaceY();
t.straight(10);
const w3 = t.lastCenter(); const hw3 = t.lastHeading(); const yw3 = t.lastSurfaceY();
t.straight(10);                                                               // telepad 2A here
const tp2A = t.lastCenter(); const y2A = t.lastSurfaceY();

// === Jump to section 3 ===
// Reset y since section 2 had a drop(-6)
t.x = 200; t.z = 400; t.y = 0; t.heading = 0;

// === Section 3 (~40 units): Invisible, gate, 1 box ===
t.straight(10);                                                               // telepad 2B here
const tp2B = t.lastCenter(); const y2B = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const w4 = t.lastCenter(); const hw4 = t.lastHeading(); const yw4 = t.lastSurfaceY();
t.right(8);                                                                   // curve → heading π/2
t.straight(10);
const gate1 = t.lastCenter();
t.straight(10);
const w5 = t.lastCenter(); const hw5 = t.lastHeading(); const yw5 = t.lastSurfaceY();
const s3_5 = t.lastCenter();
t.straight(10);                                                               // finish

const level: LevelData = {
  name: "Level 80 — The Crucible II",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    // Section 1: 2 boxes
    { position: [s1_2[0] + 1, 0.75, s1_2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [w1[0], 0.75, w1[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    // Section 2: 2 boxes (after drop, surfaceY = -6 + 0.25 = -5.75, obstacle Y = -5.75 + 0.5 = -5.25)
    { position: [s2_3[0] + 1, s2_3[1] + 0.5, s2_3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s2_4[0] - 1, s2_4[1] + 0.5, s2_4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    // Section 3: 1 box (y reset to 0, so obstacle Y = 0.75)
    { position: [s3_5[0], 0.75, s3_5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [w1[0], yw1, w1[2]], width: 6, height: 2, rotation: hw1, gapSide: "right", gapWidth: 2.0 },
    { position: [w2[0], yw2, w2[2]], width: 6, height: 2, rotation: hw2, gapSide: "left", gapWidth: 1.5 },
    { position: [w3[0], yw3, w3[2]], width: 6, height: 2, rotation: hw3, gapSide: "center", gapWidth: 1.8 },
    { position: [w4[0], yw4, w4[2]], width: 6, height: 2, rotation: hw4, gapSide: "right", gapWidth: 1.5 },
    { position: [w5[0], yw5, w5[2]], width: 6, height: 2, rotation: hw5, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [lava1[0], lava1[1] + 1, lava1[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [magnet1[0], magnet1[1] + 1, magnet1[2]],
      size: [8, 3, 6],
      direction: [0, 0, -1],
      strength: 15,
    },
  ],
  timedGates: [
    { position: [gate1[0], 1.5, gate1[2]], size: [0.5, 2.5, 6], onTime: 2, offTime: 2 },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
};

export default level;
