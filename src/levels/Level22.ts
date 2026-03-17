import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12);
const s2 = t.lastCenter();
t.straight(12);
const s3 = t.lastCenter();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(12);
t.straight(12);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
t.straight(12);
const s6 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 22 — Gatekeeper",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2.5 },
    { position: [s5[0], 1.5, s5[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 3.0 },
  ],
};

export default level;
