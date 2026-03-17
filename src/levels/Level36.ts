import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~30 units) ===
t.straight(10);                                                               // safe start
t.straight(10);
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// === Jump to section 2 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 2 (~34 units) ===
t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.right(8);                                                                   // curve → heading π/2
t.straight(14);
const s2_3 = t.lastCenter();
t.straight(10);                                                               // telepad 2A here
const tp2A = t.lastCenter(); const y2A = t.lastSurfaceY();

// === Jump to section 3 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 3 (~34 units) ===
t.straight(10);                                                               // telepad 2B here
const tp2B = t.lastCenter(); const y2B = t.lastSurfaceY();
t.left(8);                                                                    // curve → heading -π/2
t.straight(14);
const s3_3 = t.lastCenter();
t.straight(10);                                                               // finish

const level: LevelData = {
  name: "Level 36 — Teleport Relay",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2_3[0], 0.75, s2_3[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3_3[0], 0.75, s3_3[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [tp2B[0] + 1, 0.75, tp2B[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
};

export default level;
