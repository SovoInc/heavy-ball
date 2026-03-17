import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12, { surfaceType: SurfaceType.Ice });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-6);
t.straight(14);
const s4 = t.lastCenter();
t.left(8);
t.straight(10);
const s6 = t.lastCenter();

const level: LevelData = {
  name: "Level 11 — Frozen Chasm",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] - 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], s6[1] + 0.5, s6[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
