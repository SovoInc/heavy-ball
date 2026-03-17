import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.straight(6);
const s3 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 77 — Speed Demon II",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s8[0] + 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 2.0 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 2.0 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "right", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s5[0], 1.5, s5[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
