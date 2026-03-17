import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~50 units) ===
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
const s1b = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Lava });
const s1d = t.lastCenter();
t.straight(10);
const s1e = t.lastCenter();
const h1e = t.lastHeading();
const y1e = t.lastSurfaceY();
t.straight(10);
const tpA = t.lastCenter();
const yA = t.lastSurfaceY();

// === Jump to new position (creates empty space) ===
t.x += 30;
t.z = 2;
t.heading = 0;

// === Section 2 (~50 units) ===
t.straight(10);
const tpB = t.lastCenter();
const yB = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s2d = t.lastCenter();
const h2d = t.lastHeading();
const y2d = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s2e = t.lastCenter();
t.right(8);
// After right turn, heading is back to 0 (-Z)
t.straight(10);
const s2g = t.lastCenter();
const h2g = t.lastHeading();
const y2g = t.lastSurfaceY();
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
    // Section 2
    { position: [s2e[0], 0.75, s2e[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2g[0] - 1, 0.75, s2g[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s1e[0], y1e, s1e[2]], width: 6, height: 2, rotation: h1e, gapSide: "right", gapWidth: 1.5 },
    { position: [s2d[0], y2d, s2d[2]], width: 6, height: 2, rotation: h2d, gapSide: "left", gapWidth: 1.5 },
    { position: [s2g[0], y2g, s2g[2]], width: 6, height: 2, rotation: h2g, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s2d[0], s2d[1] + 1, s2d[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 10,
    },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
