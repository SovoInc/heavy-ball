import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                 // safe start
t.straight(10);
const g1 = t.lastCenter();
t.straight(10);
const s3 = t.lastCenter();
t.left(6);                     // curve 1
t.straight(10);
const g2 = t.lastCenter();
t.straight(10);
const g3 = t.lastCenter();
t.right(6);                    // curve 2
t.straight(10);

// ~10+10+10+~9.4+10+10+~9.4+10 = ~78.8 → trim to ~70
const level: LevelData = {
  name: "Level 48 — Gate Keeper",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [g3[0], 0.75, g3[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  timedGates: [
    { position: [g1[0], 1.5, g1[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2.0 },
    { position: [g2[0], 1.5, g2[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
    { position: [g3[0], 1.5, g3[2]], size: [0.5, 2.5, 6], onTime: 2.5, offTime: 1.5 },
  ],
};

export default level;
