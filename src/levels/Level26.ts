import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s2 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Magnet });
t.straight(10);
const s5 = t.lastCenter();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(12);
const s7 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 26 — Magnetic Pull",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0] - 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
