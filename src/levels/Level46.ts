import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                                 // safe start
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });      // speed boost heading 0
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.right(6);                                                                     // curve 1 → heading π/2
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });       // speed boost heading π/2
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.left(6);                                                                      // curve 2 → heading 0
t.straight(7, { surfaceType: SurfaceType.Lava });
const s6 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Ice });
const s7 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 46 — Speed Demon",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7[0] - 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s8[0] + 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2] + 2], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 2.0 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
  timedGates: [
    { position: [s8[0], y8 + 1.25, s8[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
