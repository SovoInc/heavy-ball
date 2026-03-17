import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
const y2 = t.lastSurfaceY();
t.straight(8);
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(8);
const s6 = t.lastCenter();
const y6 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10);
const s8 = t.lastCenter();
const y8 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 68 — Teleport Maze",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "left", gapWidth: 2.0 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "right", gapWidth: 2.0 },
  ],
  teleportPairs: [
    { a: [s2[0], y2, s2[2]], b: [s6[0], y6, s6[2]] },
    { a: [s3[0], y3, s3[2] - 3], b: [s8[0], y8, s8[2]] },
  ],
};

export default level;
