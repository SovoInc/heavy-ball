import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Event Horizon: No two same surfaces adjacent ---

// Section 1
t.straight(10);                                                               // safe start (Normal)
t.straight(14, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s3 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Lava });
t.right(8);                                                                   // curve 1 → heading π/2

// Section 2
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.left(8);                                                                    // curve 2 → heading 0

// Section 3
t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(12);                                                               // Normal
const s11 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s12 = t.lastCenter();
t.left(6);                                                                    // curve 3 → heading -π/2

// Section 4
t.straight(10, { surfaceType: SurfaceType.Lava });
const s14 = t.lastCenter(); const h14 = t.lastHeading(); const y14 = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s15 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Magnet });
t.right(8);                                                                   // curve 4 → heading 0

// Section 5
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.straight(14, { surfaceType: SurfaceType.Crumbling });
const s19 = t.lastCenter(); const h19 = t.lastHeading(); const y19 = t.lastSurfaceY();
t.straight(12);                                                               // Normal
const s20 = t.lastCenter();
t.right(8);                                                                   // curve 5 → heading π/2

// Section 6
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(14, { surfaceType: SurfaceType.Ice });
const s23 = t.lastCenter(); const h23 = t.lastHeading(); const y23 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Magnet });
const s24 = t.lastCenter();
t.left(8);                                                                    // curve 6 → heading 0

// Section 7
t.straight(12, { surfaceType: SurfaceType.Lava });
const s26 = t.lastCenter(); const h26 = t.lastHeading(); const y26 = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s27 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.left(6);                                                                    // curve 7 → heading -π/2

// Section 8
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s30 = t.lastCenter(); const h30 = t.lastHeading(); const y30 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(14);                                                               // Normal
const s32 = t.lastCenter();
t.right(8);                                                                   // curve 8 → heading 0

// Section 9
t.straight(12, { surfaceType: SurfaceType.Ice });
t.right(8);                                                                   // curve 9 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Magnet });
t.left(8);                                                                    // curve 10 → heading 0
t.straight(10);

// Total: ~10+14+12+10+12.6+14+12+10+12.6+14+12+14+9.4+10+14+12+12.6+10+14+12+12.6+10+14+10+12.6+12+14+10+9.4+12+10+14+12.6+12+12.6+14+12.6+10 = ~448

const level: LevelData = {
  name: "Level 99 — Event Horizon",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s11[0] + 1, s11[1] + 0.5, s11[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s15[0], s15[1] + 0.5, s15[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s20[0] - 1, s20[1] + 0.5, s20[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s24[0], s24[1] + 0.5, s24[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s27[0] + 1, s27[1] + 0.5, s27[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s32[0] - 1, s32[1] + 0.5, s32[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s32[0] + 1, s32[1] + 0.5, s32[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "center", gapWidth: 1.5 },
    { position: [s14[0], y14, s14[2]], width: 6, height: 2, rotation: h14, gapSide: "right", gapWidth: 1.8 },
    { position: [s19[0], y19, s19[2]], width: 6, height: 2, rotation: h19, gapSide: "left", gapWidth: 1.5 },
    { position: [s23[0], y23, s23[2]], width: 6, height: 2, rotation: h23, gapSide: "center", gapWidth: 1.5 },
    { position: [s26[0], y26, s26[2]], width: 6, height: 2, rotation: h26, gapSide: "right", gapWidth: 1.5 },
    { position: [s30[0], y30, s30[2]], width: 6, height: 2, rotation: h30, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 12],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [6, 3, 14],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s20[0], s20[1] + 1, s20[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 10,
    },
    {
      position: [s27[0], s27[1] + 1, s27[2]],
      size: [6, 3, 14],
      direction: [0, 0, -1],
      strength: 15,
    },
  ],
  timedGates: [
    { position: [s11[0], s11[1] + 1.25, s11[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s15[0], s15[1] + 1.25, s15[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
    { position: [s24[0], s24[1] + 1.25, s24[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
    { position: [s32[0], s32[1] + 1.25, s32[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
  ],
};

export default level;
