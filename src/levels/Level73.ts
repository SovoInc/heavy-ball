import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(7, { surfaceType: SurfaceType.Lava });
const s2 = t.lastCenter();
t.straight(6);
const s3 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
t.straight(6);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.straight(6);
const s8 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s9 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Ice });
const s9b = t.lastCenter();
const h9b = t.lastHeading();
const y9b = t.lastSurfaceY();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s9d = t.lastCenter();
const h9d = t.lastHeading();
const y9d = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s9e = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Lava });
const s9f = t.lastCenter();
const h9f = t.lastHeading();
const y9f = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 73 — Lava Gate Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5[0] - 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9e[0] + 1, 0.75, s9e[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "right", gapWidth: 1.5 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 1.5 },
    { position: [s9b[0], y9b, s9b[2]], width: 6, height: 2, rotation: h9b, gapSide: "center", gapWidth: 1.5 },
    { position: [s9d[0], y9d, s9d[2]], width: 6, height: 2, rotation: h9d, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s9b[0], s9b[1] + 1, s9b[2]],
      size: [6, 3, 10],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s9d[0], s9d[1] + 1, s9d[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 15,
    },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s4[0], 1.5, s4[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s7[0], 1.5, s7[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
    { position: [s9[0], 1.5, s9[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
    { position: [s9f[0], 1.5, s9f[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
  ],
};

export default level;
