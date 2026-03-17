import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 ===
t.straight(10);
t.straight(12);
t.straight(10);
const tpA = t.lastCenter();
const yA = t.lastSurfaceY();

// === Jump to new position (creates empty space) ===
t.x += 30;
t.z = 2;
t.heading = 0;

// === Section 2 ===
t.straight(10);
const tpB = t.lastCenter();
const yB = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(14);
const s2c = t.lastCenter();
t.straight(10);
const s2d = t.lastCenter();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10);
const s2f = t.lastCenter();

const level: LevelData = {
  name: "Level 49 — Teleport Shuffle",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2c[0], 0.75, s2c[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s2d[0], 0.75, s2d[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2f[0] + 1, 0.75, s2f[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
