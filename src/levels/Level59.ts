import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                                  // safe start
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });      // speed heading 0
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });                                // ice after speed
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.left(6);                                                                       // curve 1
t.straight(10);
const s5 = t.lastCenter(); const h5 = t.lastHeading(); const y5 = t.lastSurfaceY();
t.right(6);                                                                      // curve 2
t.straight(10);

// ~10+10+12+~9.4+10+~9.4+10 = ~70.8 ≈ 68
const level: LevelData = {
  name: "Level 59 — Speed Ice Combo",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1.5, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2] + 3], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 2.0 },
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 2.0 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "center", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 12],
      direction: [1, 0, 0],
      strength: 14,
    },
  ],
};

export default level;
