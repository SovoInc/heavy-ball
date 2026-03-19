import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                           // safe start
t.straight(10, { surfaceType: SurfaceType.Ice });         // ice
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.left(6);                                                // curve 1
t.straight(10, { surfaceType: SurfaceType.Crumbling });   // crumbling
const s4 = t.lastCenter();
t.right(6);                                               // curve 2
t.straight(7, { surfaceType: SurfaceType.Lava });         // lava
const s6a = t.lastCenter();
const h6a = t.lastHeading();
const y6a = t.lastSurfaceY();
t.straight(8);
const s6 = t.lastCenter();
t.left(6);                                                // curve 3
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s8 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.right(6);                                               // curve 4
t.straight(6, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(10);

const level: LevelData = {
  name: "Level 51 — Triple Threat",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s6a[0], y6a, s6a[2]], width: 6, height: 2, rotation: h6a, gapSide: "right", gapWidth: 1.8 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "left", gapWidth: 1.6 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 6],
      direction: [0, 0, 1],
      strength: 10,
    },
  ],
};

export default level;
