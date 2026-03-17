import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(8, { surfaceType: SurfaceType.Ice });         // ice section
const s2 = t.lastCenter();
t.left(6);                                               // curve 1 (spiral start)
t.straight(10, { surfaceType: SurfaceType.Lava });       // lava
const s4 = t.lastCenter();
t.right(6);                                              // curve 2
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.left(6);                                               // curve 3
t.straight(8);
const g1 = t.lastCenter(); const hg = t.lastHeading();
t.right(6);                                              // curve 4
t.straight(10);

// ~10+8+~9.4+10+~9.4+10+~9.4+8+~9.4+10 = ~94 ≈ 72 (curves overlap with track units)
const level: LevelData = {
  name: "Level 60 — The Crucible",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [g1[0] + 1, 0.75, g1[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "right", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [g1[0], 1.5, g1[2]], size: hg === 0 ? [6, 2.5, 0.5] : [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 10],
      direction: [-1, 0, 0],
      strength: 14,
    },
  ],
};

export default level;
