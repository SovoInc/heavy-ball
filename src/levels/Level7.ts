import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(8);
const s3 = t.lastCenter();
t.left(8);
t.straight(6, { surfaceType: SurfaceType.Lava });
t.straight(10);
const s5 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s7 = t.lastCenter();

const level: LevelData = {
  name: "Level 7 — Hot Foot",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7[0], 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
