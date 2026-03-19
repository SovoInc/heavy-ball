import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 ===
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10);
t.straight(7, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
t.straight(10);
const tpA = t.lastCenter();
const yA = t.lastSurfaceY();

// === Jump to new position (creates empty space) ===
t.x += 30;
t.z = 2;
t.heading = 0;

// === Section 2 ===
t.straight(10);
const tpB = t.lastCenter();
const yB = t.lastSurfaceY();
t.straight(10);
const s2b = t.lastCenter();
const h2b = t.lastHeading();
const y2b = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s2d = t.lastCenter();
t.left(8);
t.straight(10);
const s2f = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 30 — Warp Tactics",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2d[0] + 1, 0.75, s2d[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s2f[0], 0.75, s2f[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s2f[0], 0.75, s2f[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s2b[0], y2b, s2b[2]], width: 6, height: 2, rotation: h2b, gapSide: "center", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
