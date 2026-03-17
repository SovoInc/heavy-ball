import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
const s4 = t.lastCenter();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(6);
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2, offTime: 1.5 } });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10);

const level: LevelData = {
  name: "Level 64 — Invisible Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0] + 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 2.0 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "right", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 8],
      direction: [0, 0, -1],
      strength: 10,
    },
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 6],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
