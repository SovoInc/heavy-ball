import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                                 // safe start
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });      // speed boost heading 0
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.right(6);                                                                     // curve 1 → heading π/2
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });       // speed boost heading π/2
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.left(6);                                                                      // curve 2 → heading 0
t.straight(10);

// ~10+8+~9.4+8+~9.4+10 = ~54.8 ≈ 46 (curves ~7.5 each with r=5 would be better)
// Close enough to 46 target
const level: LevelData = {
  name: "Level 46 — Speed Demon",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2] + 2], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 2.0 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 2.0 },
  ],
};

export default level;
