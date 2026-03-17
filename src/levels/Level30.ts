import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
const y2 = t.lastSurfaceY();
t.straight(10);
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.straight(10);
const s4 = t.lastCenter();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s6 = t.lastCenter();
t.straight(10);
const s7 = t.lastCenter();
const y7 = t.lastSurfaceY();
t.straight(10);
const s8 = t.lastCenter();

const level: LevelData = {
  name: "Level 30 — Warp Tactics",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0], 0.75, s7[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 1.5 },
  ],
  teleportPairs: [
    { a: [s2[0], y2, s2[2]], b: [s7[0], y7, s7[2]] },
  ],
};

export default level;
