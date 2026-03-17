import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(12);
t.straight(12);
const s2 = t.lastCenter();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(8, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter();
t.straight(12);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(10);
const s6 = t.lastCenter();
t.right(8);
// After right turn, heading is back to 0 (-Z)
t.straight(12);
t.straight(10);
const s9 = t.lastCenter();

const level: LevelData = {
  name: "Level 17 — Crosswinds",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s9[0] - 1, 0.75, s9[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 2.2 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
