import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~75 units) ===
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s1b = t.lastCenter();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s1d = t.lastCenter();
const h1d = t.lastHeading();
const y1d = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s1e = t.lastCenter();
const h1e = t.lastHeading();
const y1e = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s1f = t.lastCenter();
t.right(8);
// After right turn, heading is back to 0 (-Z)
t.straight(10);
const tpA = t.lastCenter();
const yA = t.lastSurfaceY();

// === Jump to new position (creates empty space) ===
t.x += 30;
t.z = 2;
t.heading = 0;

// === Section 2 (~85 units) ===
t.straight(10);
const tpB = t.lastCenter();
const yB = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s2b = t.lastCenter();
const h2b = t.lastHeading();
const y2b = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s2d = t.lastCenter();
const h2d = t.lastHeading();
const y2d = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s2e = t.lastCenter();
t.right(8);
// After right turn, heading is back to 0 (-Z)
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
const s2g = t.lastCenter();
const h2g = t.lastHeading();
const y2g = t.lastSurfaceY();
t.straight(10);
const s2h = t.lastCenter();
const h2h = t.lastHeading();
const y2h = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s2i = t.lastCenter();
const h2i = t.lastHeading();
const y2i = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2j = t.lastCenter();
const h2j = t.lastHeading();
const y2j = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s2k = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 78 — The Long Road",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    // Section 1
    { position: [s1b[0] + 1, 0.75, s1b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s1e[0], 0.75, s1e[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s1f[0], 0.75, s1f[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    // Section 2
    { position: [s2d[0], 0.75, s2d[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s2g[0] - 1, 0.75, s2g[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s2h[0] + 1, 0.75, s2h[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2k[0] - 1, 0.75, s2k[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s1d[0], y1d, s1d[2]], width: 6, height: 2, rotation: h1d, gapSide: "right", gapWidth: 1.5 },
    { position: [s1e[0], y1e, s1e[2]], width: 6, height: 2, rotation: h1e, gapSide: "left", gapWidth: 1.5 },
    { position: [s2b[0], y2b, s2b[2]], width: 6, height: 2, rotation: h2b, gapSide: "left", gapWidth: 1.5 },
    { position: [s2g[0], y2g, s2g[2]], width: 6, height: 2, rotation: h2g, gapSide: "center", gapWidth: 1.5 },
    { position: [s2h[0], y2h, s2h[2]], width: 6, height: 2, rotation: h2h, gapSide: "right", gapWidth: 1.5 },
    { position: [s2j[0], y2j, s2j[2]], width: 6, height: 2, rotation: h2j, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s2d[0], s2d[1] + 1, s2d[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 14,
    },
    {
      position: [s2i[0], s2i[1] + 1, s2i[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 16,
    },
    {
      position: [s2j[0], s2j[1] + 1, s2j[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 13,
    },
  ],
  timedGates: [
    { position: [s1d[0], 1.5, s1d[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [s2h[0], 1.5, s2h[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s2k[0], 1.5, s2k[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
