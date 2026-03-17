import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-6);
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s4 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(12);
const s6 = t.lastCenter();
t.straight(10);
const s7 = t.lastCenter();

const level: LevelData = {
  name: "Level 18 — Bounce House",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], s6[1] + 0.5, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0], s7[1] + 0.5, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
