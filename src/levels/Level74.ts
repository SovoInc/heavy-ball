import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8);
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s13 = t.lastCenter();
const h13 = t.lastHeading();
const y13 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s14 = t.lastCenter();
t.straight(12, { surfaceType: SurfaceType.Ice });
const s15 = t.lastCenter();
const h15 = t.lastHeading();
const y15 = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s17 = t.lastCenter();
const h17 = t.lastHeading();
const y17 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 74 — Crumble Bounce Chain",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0] + 1, s5[1] + 0.5, s5[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s5[0] - 1, s5[1] + 0.5, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0] + 1, s9[1] + 0.5, s9[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0] - 1, s9[1] + 0.5, s9[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s14[0], s14[1] + 0.5, s14[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s15[0], s15[1] + 0.5, s15[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "right", gapWidth: 1.5 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "left", gapWidth: 1.5 },
    { position: [s15[0], y15, s15[2]], width: 6, height: 2, rotation: h15, gapSide: "center", gapWidth: 1.5 },
    { position: [s17[0], y17, s17[2]], width: 6, height: 2, rotation: h17, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s9[0], s9[1] + 1, s9[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 14,
    },
    {
      position: [s15[0], s15[1] + 1, s15[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 15,
    },
  ],
  timedGates: [
    { position: [s13[0], s13[1] + 1.25, s13[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 1.5 },
    { position: [s17[0], s17[1] + 1.25, s17[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
  ],
};

export default level;
