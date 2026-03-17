import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(12, { surfaceType: SurfaceType.Magnet });     // magnet pull
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.left(6);                                               // curve 1
t.straight(10);
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Magnet });      // magnet pull 2
t.right(6);                                              // curve 2
t.straight(10);

// ~10+12+~9.4+10+8+~9.4+10 = ~68.8 ≈ 64
const level: LevelData = {
  name: "Level 45 — Magnetic Pull",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1.5, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0] - 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0] + 1, 0.75, s4[2] + 2], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2] + 3], width: 6, height: 2, rotation: h2, gapSide: "left", gapWidth: 2.0 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
  ],
};

export default level;
