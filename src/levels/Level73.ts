import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Lava });
const s2 = t.lastCenter();
t.straight(6);
const s3 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
t.straight(6);
const s5 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter();
t.straight(6);
const s8 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Lava });
const s9 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 73 — Lava Gate Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5[0] - 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s4[0], 1.5, s4[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s7[0], 1.5, s7[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
    { position: [s9[0], 1.5, s9[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
  ],
};

export default level;
