import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                         // safe start
t.straight(14, { surfaceType: SurfaceType.Lava });      // lava segment
const s2 = t.lastCenter();
t.right(6);                                             // curve 1
t.straight(12);
const s4 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Lava });       // more lava
const s5 = t.lastCenter();
t.left(6);                                              // curve 2
t.straight(10);

// ~10+14+~9.4+12+8+~9.4+10 = ~72.8 ≈ 68
const level: LevelData = {
  name: "Level 42 — Lava Wind Tunnel",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [6, 3, 8],
      direction: [-1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
