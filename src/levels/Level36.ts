import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~30 units) ===
t.straight(10);                                                               // safe start
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(10, { surfaceType: SurfaceType.Ice });
const s1c = t.lastCenter();
const h1c = t.lastHeading();
const y1c = t.lastSurfaceY();
t.straight(10);                                                               // telepad 1A here
const tp1A = t.lastCenter(); const y1A = t.lastSurfaceY();

// === Jump to section 2 ===
t.x += 30; t.z = 2; t.y = 0; t.heading = 0;

// === Section 2 (~34 units) ===
t.straight(10);                                                               // telepad 1B here
const tp1B = t.lastCenter(); const y1B = t.lastSurfaceY();
t.right(8);                                                                   // curve → heading π/2
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s2_2 = t.lastCenter();
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
t.straight(7, { surfaceType: SurfaceType.Lava });
const s3_2 = t.lastCenter();
t.straight(14);
const s3_3 = t.lastCenter();
const h3_3 = t.lastHeading();
const y3_3 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Ice });
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
    { position: [s2_2[0], 0.75, s2_2[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s1c[0], y1c, s1c[2]], width: 6, height: 2, rotation: h1c, gapSide: "center", gapWidth: 2.0 },
    { position: [s3_3[0], y3_3, s3_3[2]], width: 6, height: 2, rotation: h3_3, gapSide: "right", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s3_2[0], s3_2[1] + 1, s3_2[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
  timedGates: [
    { position: [s2_3[0], 0.75 + 1.25, s2_3[2]], size: [0.5, 2.5, 6], onTime: 2.5, offTime: 2 },
  ],
  teleportPairs: [
    { a: [tp1A[0], y1A, tp1A[2]], b: [tp1B[0], y1B, tp1B[2]] },
    { a: [tp2A[0], y2A, tp2A[2]], b: [tp2B[0], y2B, tp2B[2]] },
  ],
};

export default level;
