import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8);
const s3 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s7 = t.lastCenter();

const level: LevelData = {
  name: "Level 14 — Bounce Chain",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, s3[1] + 0.5, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0] - 1, s7[1] + 0.5, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
};

export default level;
