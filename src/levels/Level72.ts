import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 72 — Wind Tunnel Extreme",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 10],
      direction: [1, 0, 0],
      strength: 15,
    },
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 10],
      direction: [0, 0, -1],
      strength: 15,
    },
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 15,
    },
  ],
};

export default level;
