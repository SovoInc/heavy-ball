import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(16, { surfaceType: SurfaceType.Ice });        // long ice
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.left(6);                                               // curve 1
t.straight(8);
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.straight(6);
const s5 = t.lastCenter(); const h5 = t.lastHeading(); const y5 = t.lastSurfaceY();
t.right(6);                                              // curve 2
t.straight(10);

// ~10+16+~9.4+8+6+~9.4+10 = ~68.8 ≈ 58
const level: LevelData = {
  name: "Level 53 — Windswept Ice",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1.5, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0] - 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2] - 4], width: 6, height: 2, rotation: h2, gapSide: "left", gapWidth: 2.0 },
    { position: [s2[0], y2, s2[2] + 4], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 2.0 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "center", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 16],
      direction: [1, 0, 0],
      strength: 14,
    },
  ],
};

export default level;
