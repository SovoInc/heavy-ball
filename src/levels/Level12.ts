import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Lava });
t.straight(6, { surfaceType: SurfaceType.Ice });
const s3 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(6, { surfaceType: SurfaceType.Ice });
const s5 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Lava });
t.straight(10);
const s7 = t.lastCenter();

const level: LevelData = {
  name: "Level 12 — Lava and Ice",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0], 0.75, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
