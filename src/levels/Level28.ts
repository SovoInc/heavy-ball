import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
t.straight(12);
const s3 = t.lastCenter();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s5 = t.lastCenter();
t.straight(10);
const s6 = t.lastCenter();

const level: LevelData = {
  name: "Level 28 — Wind Tunnel",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 12,
    },
  ],
};

export default level;
