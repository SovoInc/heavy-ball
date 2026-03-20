import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 1
t.left(6);                                               // curve 1
t.straight(8);
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(6);                                              // curve 2
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 2
t.straight(6);
const s7 = t.lastCenter();
t.left(6);                                               // curve 3
t.straight(7, { surfaceType: SurfaceType.Lava });
const s9 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
const s10 = t.lastCenter();
const h10 = t.lastHeading();
const y10 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Magnet });
t.straight(10);

const level: LevelData = {
  name: "Level 44 — Crumble Run",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0] + 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0] - 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s10[0], 0.75, s10[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "left", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s9[0], s9[1] + 1, s9[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
  timedGates: [
    { position: [s9[0], 0.25 + 1.25, s9[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
