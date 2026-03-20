import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 ===
t.straight(10);                                                               // safe start
t.straight(10, { surfaceType: SurfaceType.Ice });                             // ice
const s1_2 = t.lastCenter(); const h1_2 = t.lastHeading(); const y1_2 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });                             // lava
const s1_3 = t.lastCenter();
t.straight(8);
const w1 = t.lastCenter(); const hw1 = t.lastHeading(); const yw1 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });                       // crumbling
const s1_5 = t.lastCenter();
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// === Jump to section 2 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 2 ===
t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.right(8);                                                                   // curve → heading π/2
t.straight(10, { surfaceType: SurfaceType.Ice });                             // ice
const s2_3 = t.lastCenter(); const h2_3 = t.lastHeading(); const y2_3 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });                             // lava
const w2 = t.lastCenter(); const hw2 = t.lastHeading(); const yw2 = t.lastSurfaceY();
t.straight(8);
const s2_4 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s2_6 = t.lastCenter();
t.straight(10);                                                               // telepad 2A here
const tp2A = t.lastCenter(); const y2A = t.lastSurfaceY();

// === Jump to section 3 ===
t.x += 50; t.z = 2; t.y = 0; t.heading = 0;

// === Section 3 ===
t.straight(10);                                                               // telepad 2B here
const tp2B = t.lastCenter(); const y2B = t.lastSurfaceY();
t.left(8);                                                                    // curve → heading -π/2
t.straight(10, { surfaceType: SurfaceType.Crumbling });                       // crumbling
const s3_3 = t.lastCenter(); const h3_3 = t.lastHeading(); const y3_3 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Magnet });                           // magnet
const s3_4 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });                             // lava
const s3_5 = t.lastCenter();
t.straight(10);                                                               // finish

const level: LevelData = {
  name: "Level 68 — Teleport Maze",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [w1[0] + 1, 0.75, w1[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2_4[0], 0.75, s2_4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s3_3[0], 0.75, s3_3[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3_4[0], 0.75, s3_4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [w1[0], yw1, w1[2]], width: 6, height: 2, rotation: hw1, gapSide: "left", gapWidth: 1.8 },
    { position: [w2[0], yw2, w2[2]], width: 6, height: 2, rotation: hw2, gapSide: "right", gapWidth: 1.7 },
    { position: [s3_3[0], y3_3, s3_3[2]], width: 6, height: 2, rotation: h3_3, gapSide: "center", gapWidth: 1.6 },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
  windZones: [
    {
      position: [s1_3[0], s1_3[1] + 1, s1_3[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s2_6[0], s2_6[1] + 1, s2_6[2]],
      size: [6, 3, 6],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s3_5[0], s3_5[1] + 1, s3_5[2]],
      size: [6, 3, 7],
      direction: [0, 0, 1],
      strength: 10,
    },
  ],
};

export default level;
