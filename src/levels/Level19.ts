import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Ice });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Lava });
t.straight(10);
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s9 = t.lastCenter();
t.straight(8);

const level: LevelData = {
  name: "Level 19 — Zigzag Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7[0] + 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 2.0 },
  ],
};

export default level;
