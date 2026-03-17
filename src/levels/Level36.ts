import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
const y2 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(14);
const s4 = t.lastCenter();
t.straight(10);
const s5 = t.lastCenter();
const y5 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(14);
const s7 = t.lastCenter();
t.straight(10);
const s8 = t.lastCenter();
const y8 = t.lastSurfaceY();
t.straight(10);
const s9 = t.lastCenter();

const level: LevelData = {
  name: "Level 36 — Teleport Relay",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0] + 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0] - 1, 0.75, s9[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  teleportPairs: [
    { a: [s2[0], y2, s2[2]], b: [s5[0] - 1, y5, s5[2]] },
    { a: [s5[0] + 1, y5, s5[2]], b: [s8[0], y8, s8[2]] },
  ],
};

export default level;
