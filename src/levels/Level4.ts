import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12);
const s2 = t.lastCenter();
t.straight(12);
const s3 = t.lastCenter();
t.straight(12);
const s4 = t.lastCenter();
t.straight(12);
const s5 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 4 — Box Garden",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] - 1.5, 0.75, s2[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s2[0] + 1.5, 0.75, s2[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s3[0] + 1, 0.75, s3[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0] - 1.5, 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0] + 1.5, 0.75, s4[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s5[0] - 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0] + 1, 0.75, s5[2] + 2], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
