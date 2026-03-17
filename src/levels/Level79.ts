import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.right(6);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
t.drop(-3);
t.left(6);
// After left turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.right(6);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s8 = t.lastCenter();
t.drop(-3);
t.left(6);
// After left turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
const s10 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 79 — Storm's Eye",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, s6[1] + 0.5, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s8[0], s8[1] + 0.5, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s10[0] + 1, s10[1] + 0.5, s10[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 8],
      direction: [0, 0, -1],
      strength: 15,
    },
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 8],
      direction: [0, 0, 1],
      strength: 15,
    },
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 15,
    },
  ],
};

export default level;
