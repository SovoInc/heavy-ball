import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.right(6);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(6);
// After left turn, heading is back to 0 (-Z)
t.straight(6);
const s6 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(6);
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10);

const level: LevelData = {
  name: "Level 63 — Crumble Chain",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0] + 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "left", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 6],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
