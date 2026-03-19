import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12, { surfaceType: SurfaceType.Ice });
t.straight(8);
const s3 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
t.right(8);
t.straight(10);
const s6 = t.lastCenter();

const level: LevelData = {
  name: "Level 6 — Frozen Lake",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1.5, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s3[0] + 1.5, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
