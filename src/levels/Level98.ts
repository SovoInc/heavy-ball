import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();

// --- Ragnarok: Max intensity everything ---

// Section 1: Opening
t.straight(10);                                                               // safe start
t.straight(16, { surfaceType: SurfaceType.Lava });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12);
const s3 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2

// Section 2: Speed + bounce
t.straight(16, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 2 → heading 0

// Section 3: Magnet + crumbling
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();
t.straight(12);
const s10 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.left(6);                                                                    // curve 3 → heading -π/2

// Section 4: Invisible + lava
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(12);
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(16, { surfaceType: SurfaceType.Lava });
const s14 = t.lastCenter();
t.right(8);                                                                   // curve 4 → heading 0

// Section 5: Speed corridor
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s16 = t.lastCenter(); const h16 = t.lastHeading(); const y16 = t.lastSurfaceY();
t.straight(12);
const s17 = t.lastCenter();
t.right(8);                                                                   // curve 5 → heading π/2

// Section 6: Ice gauntlet
t.straight(14, { surfaceType: SurfaceType.Ice });
const s19 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-3);
t.left(8);                                                                    // curve 6 → heading 0

// Section 7: Magnet marathon
t.straight(16, { surfaceType: SurfaceType.Magnet });
const s22 = t.lastCenter(); const h22 = t.lastHeading(); const y22 = t.lastSurfaceY();
t.straight(12);
const s23 = t.lastCenter();
t.left(6);                                                                    // curve 7 → heading -π/2

// Section 8: Crumbling + invisible
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s25 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(14);
const s27 = t.lastCenter(); const h27 = t.lastHeading(); const y27 = t.lastSurfaceY();
t.right(8);                                                                   // curve 8 → heading 0

// Section 9: Final sprint
t.straight(16, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.right(8);                                                                   // curve 9 → heading π/2
t.straight(10);
t.straight(10);

// Total: ~10+16+12+14+12.6+16+10+12.6+14+12+10+9.4+10+12+16+12.6+14+12+12.6+14+10+12.6+16+12+9.4+12+10+14+12.6+16+12.6+10+10 = ~432

const level: LevelData = {
  name: "Level 98 — Ragnarok",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0] - 1, s10[1] + 0.5, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s14[0], s14[1] + 0.5, s14[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s17[0] + 1, s17[1] + 0.5, s17[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s19[0], s19[1] + 0.5, s19[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s23[0] - 1, s23[1] + 0.5, s23[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s25[0], s25[1] + 0.5, s25[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s27[0], s27[1] + 0.5, s27[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "center", gapWidth: 1.5 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "right", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "left", gapWidth: 1.8 },
    { position: [s16[0], y16, s16[2]], width: 6, height: 2, rotation: h16, gapSide: "center", gapWidth: 1.5 },
    { position: [s22[0], y22, s22[2]], width: 6, height: 2, rotation: h22, gapSide: "right", gapWidth: 1.5 },
    { position: [s27[0], y27, s27[2]], width: 6, height: 2, rotation: h27, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 12],
      direction: [1, 0, 0],
      strength: 14,
    },
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 12,
    },
    {
      position: [s17[0], s17[1] + 1, s17[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 15,
    },
    {
      position: [s25[0], s25[1] + 1, s25[2]],
      size: [6, 3, 12],
      direction: [0, 0, -1],
      strength: 12,
    },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s14[0], s14[1] + 1.25, s14[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [s19[0], s19[1] + 1.25, s19[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
    { position: [s23[0], s23[1] + 1.25, s23[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
