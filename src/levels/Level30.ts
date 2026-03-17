import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

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
t.straight(10);
const s2b = t.lastCenter();
const h2b = t.lastHeading();
const y2b = t.lastSurfaceY();
t.straight(10);
const s2c = t.lastCenter();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s2e = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 30 — Warp Tactics",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2c[0] + 1, 0.75, s2c[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s2e[0], 0.75, s2e[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s2e[0], 0.75, s2e[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s2c[0] - 1, 0.75, s2c[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s2b[0], y2b, s2b[2]], width: 6, height: 2, rotation: h2b, gapSide: "center", gapWidth: 1.5 },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
