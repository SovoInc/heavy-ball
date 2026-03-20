import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(7, { surfaceType: SurfaceType.Lava });           // lava
const s3a = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Crumbling });     // crumbling
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.straight(8);
const s6b = t.lastCenter();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(8, { surfaceType: SurfaceType.Ice });
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
const s10 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });          // magnet
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });            // second lava
const s12 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(10);

const level: LevelData = {
  name: "Level 70 — The Narrows",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s11[0] + 1, 0.75, s11[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "center", gapWidth: 1.5 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "right", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "left", gapWidth: 1.5 },
  ],
  timedGates: [
    { position: [s6b[0], 1.5, s6b[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 14,
    },
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 6],
      direction: [0, 0, 1],
      strength: 12,
    },
  ],
};

export default level;
