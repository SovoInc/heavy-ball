import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 ===
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Ice });
const s1b = t.lastCenter();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s1d = t.lastCenter();
const h1d = t.lastHeading();
const y1d = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s1e = t.lastCenter();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-6);
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s1h = t.lastCenter();
t.straight(10);
const tpA = t.lastCenter();
const yA = t.lastSurfaceY();

// === Jump to new position (creates empty space) ===
t.x = 100;
t.z = 200;
t.y = 0;
t.heading = 0;

// === Section 2 ===
t.straight(10);
const tpB = t.lastCenter();
const yB = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2b = t.lastCenter();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s2d = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s2e = t.lastCenter();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10);
const s2g = t.lastCenter();
const h2g = t.lastHeading();
const y2g = t.lastSurfaceY();
t.straight(10);
const s2h = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(10);

const level: LevelData = {
  name: "Level 40 — Chapter's End",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    // Section 1: 2 boxes
    { position: [s1b[0], 0.75, s1b[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s1h[0] + 1, s1h[1] + 0.5, s1h[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    // Section 2: 3 boxes
    { position: [s2b[0], 0.75, s2b[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s2e[0], 0.75, s2e[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s2h[0] - 1, 0.75, s2h[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s1d[0], y1d, s1d[2]], width: 6, height: 2, rotation: h1d, gapSide: "center", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [s2g[0], 1.5, s2g[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2 },
  ],
  windZones: [
    {
      position: [s2d[0], s2d[1] + 1, s2d[2]],
      size: [16, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
    {
      position: [s1e[0], s1e[1] + 1, s1e[2]],
      size: [7, 3, 6],
      direction: [0, 0, 1],
      strength: 8,
    },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
