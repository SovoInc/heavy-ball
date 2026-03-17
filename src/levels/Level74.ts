import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8);
const s5 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8);
const s9 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10);

const level: LevelData = {
  name: "Level 74 — Crumble Bounce Chain",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0] + 1, s5[1] + 0.5, s5[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s5[0] - 1, s5[1] + 0.5, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0] + 1, s9[1] + 0.5, s9[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0] - 1, s9[1] + 0.5, s9[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  windZones: [
    {
      position: [s9[0], s9[1] + 1, s9[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
