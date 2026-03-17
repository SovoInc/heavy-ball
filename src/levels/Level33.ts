import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2 = t.lastCenter();
t.straight(14);
const s3 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s5 = t.lastCenter();
t.straight(10);
const s6 = t.lastCenter();

const level: LevelData = {
  name: "Level 33 — Conveyor Chaos",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
