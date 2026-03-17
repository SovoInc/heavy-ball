import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 1
t.left(6);                                               // curve 1
t.straight(8);
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(6);                                              // curve 2
t.straight(10, { surfaceType: SurfaceType.Crumbling });  // crumbling 2
t.straight(6);
const s7 = t.lastCenter();
t.left(6);                                               // curve 3
t.straight(10);

// ~10+10+~9.4+8+~9.4+10+6+~9.4+10 = ~82 → trim: use radius 5
// Actually with radius 6: 10+10+9.4+8+9.4+10+6+9.4+10 = 82.2
// Adjust: shorter straights to hit ~64
const level: LevelData = {
  name: "Level 44 — Crumble Run",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0] + 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0] - 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
  ],
};

export default level;
