import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(14);
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s3 = t.lastCenter();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(10);
const s5 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(12);
const s8 = t.lastCenter();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(14);
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.right(8);                                                                   // curve 4 → heading 0
t.straight(12);
const s13 = t.lastCenter();
t.right(8);                                                                   // curve 5 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Magnet });
const s15 = t.lastCenter(); const h15 = t.lastHeading(); const y15 = t.lastSurfaceY();
t.straight(10);

// ~10+14+12+12.6+10+14+12.6+12+9.4+14+10+12.6+12+12.6+14+10 = ~201.8

const level: LevelData = {
  name: "Level 90 — Storm Surge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s8[0] + 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s13[0] - 1, 0.75, s13[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "right", gapWidth: 1.8 },
    { position: [s15[0], y15, s15[2]], width: 6, height: 2, rotation: h15, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 12],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [6, 3, 10],
      direction: [0, 0, 1],
      strength: 14,
    },
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 12],
      direction: [-1, 0, 0],
      strength: 10,
    },
    {
      position: [s13[0], s13[1] + 1, s13[2]],
      size: [6, 3, 12],
      direction: [0, 0, -1],
      strength: 15,
    },
  ],
};

export default level;
