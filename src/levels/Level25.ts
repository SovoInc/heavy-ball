import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
t.straight(6);
const s3 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(12);
const s6 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 25 — Now You See Me",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
