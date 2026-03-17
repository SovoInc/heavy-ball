import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                 // safe start
t.straight(12);
const tp1a = t.lastCenter(); const y1 = t.lastSurfaceY();
t.left(6);                     // curve 1
t.straight(14);
const s3 = t.lastCenter();
t.straight(10);
const tp1b = t.lastCenter(); const y2 = t.lastSurfaceY();
t.right(6);                    // curve 2
t.straight(10);

// ~10+12+~9.4+14+10+~9.4+10 = ~74.8 ≈ 66
const level: LevelData = {
  name: "Level 49 — Teleport Shuffle",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3[0] + 1, 0.75, s3[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [tp1b[0], 0.75, tp1b[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  teleportPairs: [
    { a: [tp1a[0], y1, tp1a[2]], b: [tp1b[0], y2, tp1b[2]] },
  ],
};

export default level;
