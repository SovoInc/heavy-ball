import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(8);
const s3 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12);
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(8, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s10 = t.lastCenter();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(12, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 1.5 } });
t.straight(8);
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(10, { surfaceType: SurfaceType.Bounce });
t.drop(-2);
t.straight(10);

// ~10+10+8+10+12.6+12+10+8+12.6+10+9.4+12+8+12.6+10+10 = ~165.2

const level: LevelData = {
  name: "Level 83 — Blackout Run",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0], s6[1] + 0.5, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0] + 1, s10[1] + 0.5, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s13[0], s13[1] + 0.5, s13[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.8 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "right", gapWidth: 1.8 },
  ],
};

export default level;
