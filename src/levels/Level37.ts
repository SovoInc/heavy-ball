import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(6);
const s3 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(6);
const s5 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(12);
const s7 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 37 — Phase Shift",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s5[0] + 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0], 0.75, s7[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2, offTime: 3 },
  ],
};

export default level;
