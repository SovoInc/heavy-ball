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
t.straight(7, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
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
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.drop(-3);
t.left(6);
// After left turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s10 = t.lastCenter();
const h10 = t.lastHeading();
const y10 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s10b = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s10c = t.lastCenter();
const h10c = t.lastHeading();
const y10c = t.lastSurfaceY();
t.right(6);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s10e = t.lastCenter();
const h10e = t.lastHeading();
const y10e = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s10f = t.lastCenter();
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
    { position: [s10b[0] - 1, s10b[1] + 0.5, s10b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s10f[0], s10f[1] + 0.5, s10f[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "center", gapWidth: 1.5 },
    { position: [s10c[0], y10c, s10c[2]], width: 6, height: 2, rotation: h10c, gapSide: "right", gapWidth: 1.5 },
    { position: [s10e[0], y10e, s10e[2]], width: 6, height: 2, rotation: h10e, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 7],
      direction: [0, 0, -1],
      strength: 15,
    },
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 8],
      direction: [0, 0, 1],
      strength: 16,
    },
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 15,
    },
  ],
  timedGates: [
    { position: [s10b[0], s10b[1] + 1.25, s10b[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s10e[0], s10e[1] + 1.25, s10e[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
