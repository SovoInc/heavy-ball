import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                 // safe start
t.straight(10);
const g1 = t.lastCenter();
t.straight(10);
const s3 = t.lastCenter();
t.left(6);                     // curve 1
t.straight(7, { surfaceType: SurfaceType.Lava });
const s5 = t.lastCenter();
t.straight(10);
const g2 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Ice });
const g3 = t.lastCenter();
const h3g = t.lastHeading();
const y3g = t.lastSurfaceY();
t.right(6);                    // curve 2
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s9 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
t.straight(10);

const level: LevelData = {
  name: "Level 48 — Gate Keeper",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [g3[0], 0.75, g3[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0] + 1, 0.75, s9[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  timedGates: [
    { position: [g1[0], 1.5, g1[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2.0 },
    { position: [g2[0], 0.25 + 1.25, g2[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
    { position: [g3[0], 0.25 + 1.25, g3[2]], size: [0.5, 2.5, 6], onTime: 2.5, offTime: 1.5 },
  ],
  latticeWalls: [
    { position: [g3[0], y3g, g3[2]], width: 6, height: 2, rotation: h3g, gapSide: "center", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
};

export default level;
