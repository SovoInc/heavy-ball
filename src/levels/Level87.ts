import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.straight(10);
const s4 = t.lastCenter();
t.left(8);                                                                    // curve 1 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s6 = t.lastCenter();
t.straight(8);
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.right(8);                                                                   // curve 2 → heading 0
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.right(6);                                                                   // curve 3 → heading π/2
t.straight(14);
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.left(8);                                                                    // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Crumbling });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.straight(10);

// ~10+12+8+10+12.6+12+8+12.6+10+8+9.4+14+12.6+12+8+10 = ~179.2

const level: LevelData = {
  name: "Level 87 — Shattered Path",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0], s6[1] + 0.5, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s12[0], s12[1] + 0.5, s12[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "right", gapWidth: 1.8 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 1.5 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "center", gapWidth: 1.8 },
  ],
};

export default level;
