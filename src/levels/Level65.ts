import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(7, { surfaceType: SurfaceType.Lava });           // lava
const s3a = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10, { surfaceType: SurfaceType.Ice });            // ice
const s7a = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s8 = t.lastCenter();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Crumbling });      // crumbling
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s11 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 65 — Magnet Storm",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s10[0] + 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "left", gapWidth: 1.8 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 1.7 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "center", gapWidth: 1.6 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 8],
      direction: [0, 0, 1],
      strength: 12,
    },
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 8],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s11[0], s11[1] + 1, s11[2]],
      size: [6, 3, 6],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
