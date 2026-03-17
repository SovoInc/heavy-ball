import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- 12 turns, labyrinthine path ---

// Section 1
t.straight(10);                                                               // safe start
t.straight(10);
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.right(6);                                                                   // curve 1 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter();
t.left(6);                                                                    // curve 2 → heading 0

// Section 2
t.straight(10);
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s8 = t.lastCenter();
t.right(6);                                                                   // curve 4 → heading 0

// Teleporter shortcut point A
const tpA = t.pos();
const tpAy = t.lastSurfaceY();

// Section 3
t.straight(10, { surfaceType: SurfaceType.Lava });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(8);
const s11 = t.lastCenter();
t.right(6);                                                                   // curve 5 → heading π/2

// Section 4
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.left(6);                                                                    // curve 6 → heading 0

// Section 5
t.straight(10);
const s15 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.right(6);                                                                   // curve 7 → heading π/2

// Section 6
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.left(6);                                                                    // curve 8 → heading 0
t.straight(10);
const s19 = t.lastCenter(); const h19 = t.lastHeading(); const y19 = t.lastSurfaceY();

// Section 7
t.left(6);                                                                    // curve 9 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s21 = t.lastCenter();
t.right(6);                                                                   // curve 10 → heading 0

// Section 8
t.straight(10);
const s23 = t.lastCenter(); const h23 = t.lastHeading(); const y23 = t.lastSurfaceY();
t.right(6);                                                                   // curve 11 → heading π/2

// Teleporter shortcut point B (destination — skipping sections 3-7)
const tpB = t.pos();
const tpBy = t.lastSurfaceY();

t.straight(14, { surfaceType: SurfaceType.Ice });
const s25 = t.lastCenter();
t.left(6);                                                                    // curve 12 → heading 0
t.straight(10);
t.straight(8);

// ~10+10+9.4+12+9.4+10+9.4+12+9.4+10+8+9.4+14+9.4+10+12+9.4+10+9.4+10+9.4+12+9.4+10+9.4+14+9.4+10+8 = ~333

const level: LevelData = {
  name: "Level 93 — The Labyrinth",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s11[0] + 1, 0.75, s11[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s15[0] - 1, 0.75, s15[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s21[0], 0.75, s21[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s25[0], 0.75, s25[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "center", gapWidth: 1.8 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "right", gapWidth: 1.5 },
    { position: [s19[0], y19, s19[2]], width: 6, height: 2, rotation: h19, gapSide: "left", gapWidth: 1.5 },
    { position: [s23[0], y23, s23[2]], width: 6, height: 2, rotation: h23, gapSide: "center", gapWidth: 1.5 },
  ],
  teleportPairs: [
    { a: [tpA[0], tpAy, tpA[2]], b: [tpB[0], tpBy, tpB[2]] },
  ],
};

export default level;
