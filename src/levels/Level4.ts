import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10);
const s4 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Lava });
t.straight(10);
const s6 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10);
const s8 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 4 — Box Garden",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] - 1.5, 0.75, s2[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s2[0] + 1.5, 0.75, s2[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s4[0] - 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0] + 1, 0.75, s4[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1.5, 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] + 1.5, 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0] + 1, 0.75, s8[2] + 2], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
