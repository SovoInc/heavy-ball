import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~66 units): Ice, Lava, 1 wall, 1 box ===
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Ice });
t.straight(10);
const w1 = t.lastCenter(); const hw1 = t.lastHeading(); const yw1 = t.lastSurfaceY();
const s1_box = t.lastCenter();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(14);
t.straight(10, { surfaceType: SurfaceType.Lava });
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// === Jump to section 2 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 2 (~66 units): Speed, 1 wall, 1 box ===
t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.left(8);                                                                    // curve 2 → heading -π/2
t.straight(12);
const w2 = t.lastCenter(); const hw2 = t.lastHeading(); const yw2 = t.lastSurfaceY();
const s2_box = t.lastCenter();
t.left(6);                                                                    // curve 3 → heading π (reverse)
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, 1] });
t.straight(10);
t.straight(10);                                                               // telepad 2A here
const tp2A = t.lastCenter(); const y2A = t.lastSurfaceY();

// === Jump to section 3 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 3 (~66 units): Magnet, 1 wall, 1 box ===
t.straight(10);                                                               // telepad 2B here
const tp2B = t.lastCenter(); const y2B = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Magnet });
const w3 = t.lastCenter(); const hw3 = t.lastHeading(); const yw3 = t.lastSurfaceY();
const s3_box = t.lastCenter();
t.right(8);                                                                   // curve 5 → heading π
t.straight(14);
t.straight(10);                                                               // finish

const level: LevelData = {
  name: "Level 89 — Warp Zone",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s1_box[0] + 1, 0.75, s1_box[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s2_box[0], 0.75, s2_box[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3_box[0], 0.75, s3_box[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [w1[0], yw1, w1[2]], width: 6, height: 2, rotation: hw1, gapSide: "right", gapWidth: 1.5 },
    { position: [w2[0], yw2, w2[2]], width: 6, height: 2, rotation: hw2, gapSide: "left", gapWidth: 1.5 },
    { position: [w3[0], yw3, w3[2]], width: 6, height: 2, rotation: hw3, gapSide: "center", gapWidth: 1.8 },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
};

export default level;
