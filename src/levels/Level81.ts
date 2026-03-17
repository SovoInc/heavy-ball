import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(10);
const s3 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter();
t.straight(10);
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s10 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Ice });
const s11 = t.lastCenter();
t.right(8);                                                                   // curve 3 → heading π/2
t.straight(12);
const s13 = t.lastCenter();
t.straight(10);

// ~10+12+10+14+12.6+12+10+12+12.6+10+14+12.6+12+10 = ~163.8

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
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 12,
    },
    {
      position: [s11[0], s11[1] + 1, s11[2]],
      size: [6, 3, 14],
      direction: [-1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
