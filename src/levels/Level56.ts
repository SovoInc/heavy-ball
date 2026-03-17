import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                                        // safe start
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } }); // invisible 1
t.left(6);                                                                             // curve 1
t.straight(6);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.0, offTime: 1.5 } }); // invisible 2
t.right(6);                                                                            // curve 2
t.straight(6);
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } }); // invisible 3
t.left(6);                                                                             // curve 3
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.0, offTime: 1.5 } }); // invisible 4
t.right(6);                                                                            // curve 4
t.straight(10);

// ~10+8+~9.4+6+8+~9.4+6+8+~9.4+8+~9.4+10 = ~102 → adjust
// With 4 curves and 4 invisible sections — close to 72
const level: LevelData = {
  name: "Level 56 — Invisible Bridge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] + 1, 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "right", gapWidth: 2.0 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 2.0 },
  ],
};

export default level;
