import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(6);
const s4 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Lava });
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Ice });
t.straight(10);
const s8 = t.lastCenter();

const level: LevelData = {
  name: "Level 15 — Slippery Slope",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s8[0] + 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
