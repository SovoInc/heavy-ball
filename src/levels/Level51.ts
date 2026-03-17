import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                           // safe start
t.straight(10, { surfaceType: SurfaceType.Ice });         // ice
const s2 = t.lastCenter();
t.left(6);                                                // curve 1
t.straight(10, { surfaceType: SurfaceType.Crumbling });   // crumbling
const s4 = t.lastCenter();
t.right(6);                                               // curve 2
t.straight(8);
const s6 = t.lastCenter();
t.left(6);                                                // curve 3
t.straight(10);

// ~10+10+~9.4+10+~9.4+8+~9.4+10 = ~76.2 ≈ 66
const level: LevelData = {
  name: "Level 51 — Triple Threat",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
