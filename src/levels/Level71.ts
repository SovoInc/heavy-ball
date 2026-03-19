import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~80 units) ===
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s1b = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s1d = t.lastCenter();
const h1d = t.lastHeading();
const y1d = t.lastSurfaceY();
t.straight(10);
const s1e = t.lastCenter();
const h1e = t.lastHeading();
const y1e = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s1f = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Lava });
const s1g = t.lastCenter();
const h1g = t.lastHeading();
const y1g = t.lastSurfaceY();
t.straight(10);
const tpA = t.lastCenter();
const yA = t.lastSurfaceY();

// === Jump to new position (creates empty space) ===
t.x += 30;
t.z = 2;
t.heading = 0;

// === Section 2 (~80 units) ===
t.straight(10);
const tpB = t.lastCenter();
const yB = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s2b = t.lastCenter();
const h2b = t.lastHeading();
const y2b = t.lastSurfaceY();
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s2d = t.lastCenter();
const h2d = t.lastHeading();
const y2d = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2, offTime: 1.5 } });
const s2e = t.lastCenter();
const h2e = t.lastHeading();
const y2e = t.lastSurfaceY();
t.right(8);
// After right turn, heading is back to 0 (-Z)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s2f = t.lastCenter();
const h2f = t.lastHeading();
const y2f = t.lastSurfaceY();
t.straight(10);
const s2g = t.lastCenter();
const h2g = t.lastHeading();
const y2g = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2h = t.lastCenter();
const h2h = t.lastHeading();
const y2h = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2i = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 71 — Endurance Run",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    // Section 1
    { position: [s1b[0] + 1, 0.75, s1b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s1d[0], 0.75, s1d[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s1f[0], 0.75, s1f[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    // Section 2
    { position: [s2e[0], 0.75, s2e[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2g[0] - 1, 0.75, s2g[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s2i[0] + 1, 0.75, s2i[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s1e[0], y1e, s1e[2]], width: 6, height: 2, rotation: h1e, gapSide: "right", gapWidth: 1.5 },
    { position: [s1g[0], y1g, s1g[2]], width: 6, height: 2, rotation: h1g, gapSide: "left", gapWidth: 1.5 },
    { position: [s2d[0], y2d, s2d[2]], width: 6, height: 2, rotation: h2d, gapSide: "left", gapWidth: 1.5 },
    { position: [s2g[0], y2g, s2g[2]], width: 6, height: 2, rotation: h2g, gapSide: "center", gapWidth: 1.5 },
    { position: [s2h[0], y2h, s2h[2]], width: 6, height: 2, rotation: h2h, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s2d[0], s2d[1] + 1, s2d[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 14,
    },
    {
      position: [s2f[0], s2f[1] + 1, s2f[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s2h[0], s2h[1] + 1, s2h[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 15,
    },
  ],
  timedGates: [
    { position: [s1e[0], 1.5, s1e[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [s2g[0], 1.5, s2g[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
