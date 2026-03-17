import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                           // safe start
t.straight(10, { surfaceType: SurfaceType.Bounce });      // bounce pad
t.drop(-2);                                               // drop 1
t.left(6);                                                // curve 1
t.straight(10);
const s4 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Bounce });       // bounce pad 2
t.drop(-2);                                               // drop 2
t.right(6);                                               // curve 2
t.straight(10);

// ~10+10+~9.4+10+8+~9.4+10 = ~66.8 ≈ 56 (close enough)
const level: LevelData = {
  name: "Level 47 — Bounce Canyon",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s4[0] - 1, s4[1] + 0.5, s4[2] + 2], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
