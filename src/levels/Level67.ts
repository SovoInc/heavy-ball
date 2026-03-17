import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8);
const s4 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10);

const level: LevelData = {
  name: "Level 67 — Bounce Drop Sequence",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s7[0] - 1, s7[1] + 0.5, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0] + 1, s7[1] + 0.5, s7[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
