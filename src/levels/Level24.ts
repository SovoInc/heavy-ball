import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";

const t = new TrackBuilder();

// === Section 1 ===
t.straight(10);
t.straight(10);
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
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(14);
const s2c = t.lastCenter();
t.straight(14);
const s2d = t.lastCenter();
t.straight(10);
const s2e = t.lastCenter();

const level: LevelData = {
  name: "Level 24 — Warp Zone",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2c[0], 0.75, s2c[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s2d[0], 0.75, s2d[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s2e[0], 0.75, s2e[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
