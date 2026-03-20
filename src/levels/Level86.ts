import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(10);
const s2 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.straight(10);
const s4 = t.lastCenter();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12);
const s6 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
const s7b = t.lastCenter(); const h7b = t.lastHeading(); const y7b = t.lastSurfaceY();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s10b = t.lastCenter();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(12);
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s12b = t.lastCenter(); const h12b = t.lastHeading(); const y12b = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 1.5 } });
const s14 = t.lastCenter(); const h14 = t.lastHeading(); const y14 = t.lastSurfaceY();
t.straight(10);
t.straight(8);

const level: LevelData = {
  name: "Level 86 — The Furnace",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] - 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0] + 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10b[0] - 1, 0.75, s10b[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s14[0] + 1, 0.75, s14[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 1.5 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "left", gapWidth: 1.5 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "right", gapWidth: 1.5 },
    { position: [s14[0], y14, s14[2]], width: 6, height: 2, rotation: h14, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 14,
    },
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 15,
    },
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 7],
      direction: [-1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s7b[0], 1.5, s7b[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
    { position: [s10b[0], 1.5, s10b[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s12b[0], 1.5, s12b[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 2.0 },
  ],
};

export default level;
