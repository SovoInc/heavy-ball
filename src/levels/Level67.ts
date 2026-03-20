import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8, { surfaceType: SurfaceType.Ice });            // ice after drop 1
const s4 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(7, { surfaceType: SurfaceType.Lava });           // lava (capped at 7)
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(10, { surfaceType: SurfaceType.Crumbling });     // crumbling after drop 3
const s10 = t.lastCenter(); const h10 = t.lastHeading(); const y10 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
const s12 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });          // magnet
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });            // second lava
const s14 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 67 — Bounce Drop Sequence",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s7[0] - 1, s7[1] + 0.5, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0] + 1, s7[1] + 0.5, s7[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s13[0], s13[1] + 0.5, s13[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "right", gapWidth: 1.7 },
    { position: [s10[0], y10, s10[2]], width: 6, height: 2, rotation: h10, gapSide: "left", gapWidth: 1.6 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "center", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [6, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
};

export default level;
