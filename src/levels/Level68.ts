import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~38 units) ===
t.straight(10);                                                               // safe start
t.straight(10);
t.straight(8);
const w1 = t.lastCenter(); const hw1 = t.lastHeading(); const yw1 = t.lastSurfaceY();
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// === Jump to section 2 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 2 (~38 units) ===
t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.right(8);                                                                   // curve → heading π/2
t.straight(10);
const w2 = t.lastCenter(); const hw2 = t.lastHeading(); const yw2 = t.lastSurfaceY();
t.straight(8);
const s2_4 = t.lastCenter();
t.straight(10);                                                               // telepad 2A here
const tp2A = t.lastCenter(); const y2A = t.lastSurfaceY();

// === Jump to section 3 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 3 (~28 units) ===
t.straight(10);                                                               // telepad 2B here
const tp2B = t.lastCenter(); const y2B = t.lastSurfaceY();
t.left(8);                                                                    // curve → heading -π/2
t.straight(10);
const s3_3 = t.lastCenter();
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
  ],
  latticeWalls: [
    { position: [w1[0], yw1, w1[2]], width: 6, height: 2, rotation: hw1, gapSide: "left", gapWidth: 2.0 },
    { position: [w2[0], yw2, w2[2]], width: 6, height: 2, rotation: hw2, gapSide: "right", gapWidth: 2.0 },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
};

export default level;
