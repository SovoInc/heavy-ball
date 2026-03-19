import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// === Section 1 (~167 units, 6 turns) ===
t.straight(10);                                                               // safe start
t.straight(10, { surfaceType: SurfaceType.Lava });
const s1b = t.lastCenter(); const h1b = t.lastHeading(); const y1b = t.lastSurfaceY();
t.right(6);                                                                   // turn 1 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Ice });
const s1d = t.lastCenter(); const h1d = t.lastHeading(); const y1d = t.lastSurfaceY();

// Timed gate 1
const gate1 = t.lastCenter();

t.left(6);                                                                    // turn 2 → heading 0
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s1f = t.lastCenter(); const h1f = t.lastHeading(); const y1f = t.lastSurfaceY();
t.left(6);                                                                    // turn 3 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s1h = t.lastCenter(); const h1h = t.lastHeading(); const y1h = t.lastSurfaceY();
t.right(6);                                                                   // turn 4 → heading 0
t.straight(7, { surfaceType: SurfaceType.Lava });
const s1j = t.lastCenter(); const h1j = t.lastHeading(); const y1j = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s1k = t.lastCenter();
t.right(6);                                                                   // turn 5 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Ice });
const s1m = t.lastCenter(); const h1m = t.lastHeading(); const y1m = t.lastSurfaceY();

// Timed gate 2
const gate2 = t.lastCenter();

t.left(6);                                                                    // turn 6 → heading 0
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const tpA = t.lastCenter();
const yA = t.lastSurfaceY();

// === Jump to new position (creates empty space) ===
t.x += 30;
t.z = 2;
t.heading = 0;

// === Section 2 (~167 units, 6 turns) ===
t.straight(10);
const tpB = t.lastCenter();
const yB = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s2b = t.lastCenter(); const h2b = t.lastHeading(); const y2b = t.lastSurfaceY();
t.right(6);                                                                   // turn 7 → heading π/2
t.straight(10, { surfaceType: SurfaceType.Bounce });
const s2d = t.lastCenter();
t.left(6);                                                                    // turn 8 → heading 0
t.straight(10, { surfaceType: SurfaceType.Lava });
const s2f = t.lastCenter(); const h2f = t.lastHeading(); const y2f = t.lastSurfaceY();

// Timed gate 3
const gate3 = t.lastCenter();

t.left(6);                                                                    // turn 9 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s2h = t.lastCenter(); const h2h = t.lastHeading(); const y2h = t.lastSurfaceY();
t.right(6);                                                                   // turn 10 → heading 0
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s2j = t.lastCenter(); const h2j = t.lastHeading(); const y2j = t.lastSurfaceY();
t.right(6);                                                                   // turn 11 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Ice });
const s2l = t.lastCenter(); const h2l = t.lastHeading(); const y2l = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s2m = t.lastCenter();
t.left(6);                                                                    // turn 12 → heading 0
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(8);

const level: LevelData = {
  name: "Level 93 — The Labyrinth",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    // Section 1: 3 boxes
    { position: [s1d[0], 0.75, s1d[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s1h[0], 0.75, s1h[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s1m[0] + 1, 0.75, s1m[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    // Section 2: 4 boxes
    { position: [s2d[0], 0.75, s2d[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s2h[0], 0.75, s2h[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s2l[0], 0.75, s2l[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s2m[0], 0.75, s2m[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    // Section 1: 4 walls
    { position: [s1b[0], y1b, s1b[2]], width: 6, height: 2, rotation: h1b, gapSide: "right", gapWidth: 1.5 },
    { position: [s1f[0], y1f, s1f[2]], width: 6, height: 2, rotation: h1f, gapSide: "left", gapWidth: 1.5 },
    { position: [s1j[0], y1j, s1j[2]], width: 6, height: 2, rotation: h1j, gapSide: "center", gapWidth: 1.5 },
    { position: [s1m[0], y1m, s1m[2]], width: 6, height: 2, rotation: h1m, gapSide: "right", gapWidth: 1.5 },
    // Section 2: 4 walls
    { position: [s2b[0], y2b, s2b[2]], width: 6, height: 2, rotation: h2b, gapSide: "left", gapWidth: 1.5 },
    { position: [s2f[0], y2f, s2f[2]], width: 6, height: 2, rotation: h2f, gapSide: "left", gapWidth: 1.5 },
    { position: [s2j[0], y2j, s2j[2]], width: 6, height: 2, rotation: h2j, gapSide: "center", gapWidth: 1.5 },
    { position: [s2l[0], y2l, s2l[2]], width: 6, height: 2, rotation: h2l, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s1k[0], s1k[1] + 1, s1k[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 15,
    },
    {
      position: [s2d[0], s2d[1] + 1, s2d[2]],
      size: [6, 3, 10],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s2m[0], s2m[1] + 1, s2m[2]],
      size: [6, 3, 7],
      direction: [-1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [gate1[0], 1.5, gate1[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [gate2[0], 1.5, gate2[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
    { position: [gate3[0], gate3[1] + 1.25, gate3[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
  teleportPairs: [
    { a: [tpA[0], yA, tpA[2]], b: [tpB[0], yB, tpB[2]] },
  ],
};

export default level;
