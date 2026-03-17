import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(10, { surfaceType: SurfaceType.Bounce });     // bounce section
t.straight(14, { surfaceType: SurfaceType.Lava });       // lava section
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.left(6);                                               // curve 1
t.straight(10);
const s5 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Bounce });      // bounce 2
t.right(6);                                              // curve 2
t.straight(10);

// ~10+10+14+~9.4+10+8+~9.4+10 = ~80.8 ≈ 72
const level: LevelData = {
  name: "Level 58 — Bounce and Burn",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5[0] - 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0] + 1, 0.75, s5[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 2.0 },
  ],
};

export default level;
