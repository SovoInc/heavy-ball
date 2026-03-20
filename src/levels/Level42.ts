import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                         // safe start
t.straight(7, { surfaceType: SurfaceType.Lava });       // lava segment (max 7)
const s2 = t.lastCenter();
t.right(6);                                             // curve 1
t.straight(12);
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });       // more lava (max 7)
const s5 = t.lastCenter();
t.left(6);                                              // curve 2
t.straight(8, { surfaceType: SurfaceType.Ice });
const s7 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s8 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
t.straight(10);

const level: LevelData = {
  name: "Level 42 — Lava Wind Tunnel",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [6, 3, 7],
      direction: [-1, 0, 0],
      strength: 10,
    },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "center", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [s7[0], 0.25 + 1.25, s7[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2 },
  ],
};

export default level;
