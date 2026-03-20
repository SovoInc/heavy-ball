import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~80 units): Ice, Lava, Crumbling ===
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Ice });
t.straight(10);
const w1 = t.lastCenter(); const hw1 = t.lastHeading(); const yw1 = t.lastSurfaceY();
const s1_box = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s1_lava = t.lastCenter(); const h1_lava = t.lastHeading(); const y1_lava = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s1_cr = t.lastCenter();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(14);
t.straight(7, { surfaceType: SurfaceType.Lava });
const s1_lava2 = t.lastCenter(); const h1_lava2 = t.lastHeading(); const y1_lava2 = t.lastSurfaceY();
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// === Jump to section 2 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 2 (~80 units): Speed, Invisible, Ice ===
t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.left(8);                                                                    // curve 2 → heading -π/2
t.straight(12);
const w2 = t.lastCenter(); const hw2 = t.lastHeading(); const yw2 = t.lastSurfaceY();
const s2_box = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s2_speed = t.lastCenter();
t.left(6);                                                                    // curve 3 → heading π (reverse)
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, 1] });
const s2_speed2 = t.lastCenter(); const h2_speed2 = t.lastHeading(); const y2_speed2 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s2_invis = t.lastCenter(); const h2_invis = t.lastHeading(); const y2_invis = t.lastSurfaceY();
t.straight(10);
t.straight(10);                                                               // telepad 2A here
const tp2A = t.lastCenter(); const y2A = t.lastSurfaceY();

// === Jump to section 3 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 3 (~80 units): Magnet, Crumbling, Lava ===
t.straight(10);                                                               // telepad 2B here
const tp2B = t.lastCenter(); const y2B = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Magnet });
const w3 = t.lastCenter(); const hw3 = t.lastHeading(); const yw3 = t.lastSurfaceY();
const s3_box = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s3_cr = t.lastCenter(); const h3_cr = t.lastHeading(); const y3_cr = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s3_lava = t.lastCenter(); const h3_lava = t.lastHeading(); const y3_lava = t.lastSurfaceY();
t.right(8);                                                                   // curve 5 → heading π
t.straight(12, { surfaceType: SurfaceType.Ice });
const s3_ice = t.lastCenter(); const h3_ice = t.lastHeading(); const y3_ice = t.lastSurfaceY();
t.straight(14);
t.straight(10);                                                               // finish

const level: LevelData = {
  name: "Level 89 — Warp Zone",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s1_box[0] + 1, 0.75, s1_box[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s1_cr[0] - 1, 0.75, s1_cr[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2_box[0], 0.75, s2_box[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s2_speed[0], 0.75, s2_speed[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s3_box[0], 0.75, s3_box[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s3_cr[0], 0.75, s3_cr[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [w1[0], yw1, w1[2]], width: 6, height: 2, rotation: hw1, gapSide: "right", gapWidth: 1.5 },
    { position: [s1_lava[0], y1_lava, s1_lava[2]], width: 6, height: 2, rotation: h1_lava, gapSide: "left", gapWidth: 1.5 },
    { position: [w2[0], yw2, w2[2]], width: 6, height: 2, rotation: hw2, gapSide: "left", gapWidth: 1.5 },
    { position: [s2_invis[0], y2_invis, s2_invis[2]], width: 6, height: 2, rotation: h2_invis, gapSide: "center", gapWidth: 1.5 },
    { position: [w3[0], yw3, w3[2]], width: 6, height: 2, rotation: hw3, gapSide: "center", gapWidth: 1.5 },
    { position: [s3_ice[0], y3_ice, s3_ice[2]], width: 6, height: 2, rotation: h3_ice, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s1_lava[0], s1_lava[1] + 1, s1_lava[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 15,
    },
    {
      position: [s2_speed2[0], s2_speed2[1] + 1, s2_speed2[2]],
      size: [6, 3, 14],
      direction: [-1, 0, 0],
      strength: 14,
    },
    {
      position: [s3_lava[0], s3_lava[1] + 1, s3_lava[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s1_lava2[0], 1.5, s1_lava2[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [s3_cr[0], 1.5, s3_cr[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
};

export default level;
