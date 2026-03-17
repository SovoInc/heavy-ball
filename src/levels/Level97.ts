import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Void Walker: 5 invisible sections marathon ---

// Section 1: Opening
t.straight(10);                                                               // safe start
t.straight(12);
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(8);
const s4 = t.lastCenter();
t.right(8);                                                                   // curve 1 → heading π/2

// Section 2: Ice + invisible
t.straight(14, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
t.straight(12);
const s8 = t.lastCenter();
t.left(8);                                                                    // curve 2 → heading 0

// Section 3: Relief + lava
t.straight(14);
const s10 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Lava });
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.left(6);                                                                    // curve 3 → heading -π/2

// Section 4: Magnet + invisible
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(14);
const s15 = t.lastCenter();
t.right(8);                                                                   // curve 4 → heading 0

// Section 5: Speed + bounce
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s17 = t.lastCenter(); const h17 = t.lastHeading(); const y17 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.right(8);                                                                   // curve 5 → heading π/2

// Section 6: Crumbling + invisible
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(12);
const s20 = t.lastCenter(); const h20 = t.lastHeading(); const y20 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.left(8);                                                                    // curve 6 → heading 0

// Section 7: Ice corridor
t.straight(14, { surfaceType: SurfaceType.Ice });
const s23 = t.lastCenter(); const h23 = t.lastHeading(); const y23 = t.lastSurfaceY();
t.straight(12);
const s24 = t.lastCenter();
t.left(6);                                                                    // curve 7 → heading -π/2

// Section 8: Final invisible
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(14);
const s27 = t.lastCenter(); const h27 = t.lastHeading(); const y27 = t.lastSurfaceY();
t.right(8);                                                                   // curve 8 → heading 0

// Section 9
t.straight(12, { surfaceType: SurfaceType.Magnet });
t.right(8);                                                                   // curve 9 → heading π/2
t.straight(10);
const s30 = t.lastCenter();
t.left(8);                                                                    // curve 10 → heading 0
t.straight(10);

// Total: ~10+12+10+8+12.6+14+10+12+12.6+14+12+9.4+12+10+14+12.6+14+10+12.6+10+12+10+12.6+14+12+9.4+10+14+12.6+12+12.6+10+12.6+10 = ~424

const level: LevelData = {
  name: "Level 97 — Void Walker",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0] - 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s15[0], s15[1] + 0.5, s15[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s20[0], s20[1] + 0.5, s20[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s24[0] + 1, s24[1] + 0.5, s24[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s30[0], s30[1] + 0.5, s30[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "right", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "center", gapWidth: 1.8 },
    { position: [s17[0], y17, s17[2]], width: 6, height: 2, rotation: h17, gapSide: "left", gapWidth: 1.5 },
    { position: [s20[0], y20, s20[2]], width: 6, height: 2, rotation: h20, gapSide: "right", gapWidth: 1.5 },
    { position: [s23[0], y23, s23[2]], width: 6, height: 2, rotation: h23, gapSide: "center", gapWidth: 1.5 },
    { position: [s27[0], y27, s27[2]], width: 6, height: 2, rotation: h27, gapSide: "left", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 12],
      direction: [0, 0, -1],
      strength: 10,
    },
    {
      position: [s15[0], s15[1] + 1, s15[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s24[0], s24[1] + 1, s24[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 14,
    },
  ],
  timedGates: [
    { position: [s4[0], 1.5, s4[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
    { position: [s10[0], 1.5, s10[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 2.0 },
    { position: [s24[0], s24[1] + 1.25, s24[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
