import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Section 1: Opening run ---
t.straight(10);                                                               // safe start
t.straight(14, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12);
const s3 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
t.right(8);                                                                   // curve 1 → heading π/2

// --- Section 2: Speed corridor ---
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(12);
const s7 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.left(8);                                                                    // curve 2 → heading 0

// --- Section 3: Relief + magnet ---
t.straight(14);
const s10 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.left(6);                                                                    // curve 3 → heading -π/2

// --- Section 4: Crumbling + invisible ---
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(12);
const s14 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.right(8);                                                                   // curve 4 → heading 0

// --- Section 5: Ice + lava gauntlet ---
t.straight(14, { surfaceType: SurfaceType.Ice });
const s17 = t.lastCenter(); const h17 = t.lastHeading(); const y17 = t.lastSurfaceY();
t.straight(10);
const s18 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Lava });
t.right(8);                                                                   // curve 5 → heading π/2

// --- Section 6: Final stretch ---
t.straight(14);
const s21 = t.lastCenter(); const h21 = t.lastHeading(); const y21 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
t.left(8);                                                                    // curve 6 → heading 0
t.straight(10);
t.straight(10);

// ~10+14+12+10+12.6+14+12+10+12.6+14+12+9.4+10+12+10+12.6+14+10+12+12.6+14+12+12.6+10+10 = ~313.4

const level: LevelData = {
  name: "Level 91 — The Long March",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s7[0], 0.75, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s10[0] + 1, s10[1] + 0.5, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s14[0], s14[1] + 0.5, s14[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s18[0] + 1, 0.75, s18[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "center", gapWidth: 1.8 },
    { position: [s17[0], y17, s17[2]], width: 6, height: 2, rotation: h17, gapSide: "right", gapWidth: 1.5 },
    { position: [s21[0], y21, s21[2]], width: 6, height: 2, rotation: h21, gapSide: "left", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 10],
      direction: [1, 0, 0],
      strength: 10,
    },
    {
      position: [s18[0], s18[1] + 1, s18[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 12,
    },
  ],
};

export default level;
