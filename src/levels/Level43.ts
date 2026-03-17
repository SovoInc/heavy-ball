import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                                       // safe start
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } }); // invisible 1
t.straight(6);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.left(6);                                                                            // curve 1
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.0, offTime: 1.5 } }); // invisible 2
t.straight(6);
const s6 = t.lastCenter();
t.right(6);                                                                           // curve 2
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.0, offTime: 1.5 } }); // invisible 3
t.straight(10);

// ~10+8+6+~9.4+8+6+~9.4+8+10 = ~74.8 ≈ 68
const level: LevelData = {
  name: "Level 43 — Now You See Me",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] + 1, 0.75, s6[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 2.0 },
  ],
};

export default level;
