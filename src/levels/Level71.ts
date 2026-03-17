import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Lava });
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(8);
const s6 = t.lastCenter();
const y6 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10, { surfaceType: SurfaceType.Lava });
const s11 = t.lastCenter();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Ice });
const s13 = t.lastCenter();
const y13 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 71 — Endurance Run",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s11[0], 0.75, s11[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s13[0] + 1, 0.75, s13[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 2.0 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 2.0 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "center", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
  teleportPairs: [
    { a: [s6[0], y6, s6[2]], b: [s13[0], y13, s13[2]] },
  ],
};

export default level;
