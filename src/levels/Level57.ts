import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(10, { surfaceType: SurfaceType.Magnet });     // magnet
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.left(6);                                               // curve 1 (S-curve start)
t.straight(8);
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(6);                                              // curve 2 (S-curve end)
t.straight(8, { surfaceType: SurfaceType.Magnet });      // magnet 2
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.left(6);                                               // curve 3
t.straight(10);

// ~10+10+~9.4+8+~9.4+8+~9.4+10 = ~74.2 ≈ 66
const level: LevelData = {
  name: "Level 57 — Magnet Maze",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2] + 2], width: 6, height: 2, rotation: h2, gapSide: "left", gapWidth: 2.0 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "center", gapWidth: 1.8 },
  ],
};

export default level;
