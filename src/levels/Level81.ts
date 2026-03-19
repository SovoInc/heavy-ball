import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(10);
const s3 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s3b = t.lastCenter(); const h3b = t.lastHeading(); const y3b = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter();
t.straight(10);
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s7b = t.lastCenter();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s10 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s11b = t.lastCenter(); const h11b = t.lastHeading(); const y11b = t.lastSurfaceY();
t.right(8);                                                                   // curve 3 → heading π/2
t.straight(12);
const s13 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2, offTime: 1.5 } });
const s13b = t.lastCenter(); const h13b = t.lastHeading(); const y13b = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s13c = t.lastCenter(); const h13c = t.lastHeading(); const y13c = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 81 — Frostbite Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s10[0] - 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s13[0], 0.75, s13[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7b[0], 0.75, s7b[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s11b[0] + 1, 0.75, s11b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 1.5 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "right", gapWidth: 1.5 },
    { position: [s13b[0], y13b, s13b[2]], width: 6, height: 2, rotation: h13b, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s11[0], s11[1] + 1, s11[2]],
      size: [6, 3, 14],
      direction: [-1, 0, 0],
      strength: 15,
    },
    {
      position: [s13c[0], s13c[1] + 1, s13c[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s3b[0], 1.5, s3b[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s11b[0], 1.5, s11b[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s13b[0], 1.5, s13b[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
