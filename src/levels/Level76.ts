import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Ice });
t.straight(10);

const level: LevelData = {
  name: "Level 76 — Magnet Ice Slide",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 2.0 },
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 2.0 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "center", gapWidth: 1.8 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "right", gapWidth: 2.0 },
  ],
};

export default level;
