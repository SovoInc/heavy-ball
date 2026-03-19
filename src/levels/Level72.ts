import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s2b = t.lastCenter();
const h2b = t.lastHeading();
const y2b = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2, offTime: 1.5 } });
const s4b = t.lastCenter();
const h4b = t.lastHeading();
const y4b = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s6b = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Lava });
const s6c = t.lastCenter();
const h6c = t.lastHeading();
const y6c = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s6d = t.lastCenter();
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
    { position: [s6b[0] + 1, 0.75, s6b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s6d[0] - 1, 0.75, s6d[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 1.5 },
    { position: [s4b[0], y4b, s4b[2]], width: 6, height: 2, rotation: h4b, gapSide: "left", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "right", gapWidth: 1.5 },
    { position: [s6c[0], y6c, s6c[2]], width: 6, height: 2, rotation: h6c, gapSide: "center", gapWidth: 1.5 },
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
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s2b[0], 1.5, s2b[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s6b[0], 1.5, s6b[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
  ],
};

export default level;
