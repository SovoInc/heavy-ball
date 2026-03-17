import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 1
const g1 = t.lastCenter();
t.straight(8);
const s3 = t.lastCenter();
t.left(6);                                               // curve 1
t.straight(10);
const g2 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 2
t.right(6);                                              // curve 2
t.straight(10);

// ~10+10+8+~9.4+10+10+~9.4+10 = ~76.8 ≈ 64
const level: LevelData = {
  name: "Level 54 — Crumble Gate",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3[0] - 1, 0.75, s3[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [g2[0], 0.75, g2[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  timedGates: [
    { position: [g1[0], 1.5, g1[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2.0 },
    { position: [g2[0], 1.5, g2[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
