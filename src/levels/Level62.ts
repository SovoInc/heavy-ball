import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(7, { surfaceType: SurfaceType.Lava });          // lava 1 (capped)
const s2 = t.lastCenter();
t.straight(8);
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });          // lava 2 (capped)
const s4 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Ice });            // ice
const s5a = t.lastCenter(); const h5a = t.lastHeading(); const y5a = t.lastSurfaceY();
t.straight(8);
const s6 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });          // lava 3 (capped)
const s7 = t.lastCenter();
t.straight(8);
const s8 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });          // lava 4 (capped)
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Crumbling });    // crumbling
const s11 = t.lastCenter(); const h11 = t.lastHeading(); const y11 = t.lastSurfaceY();
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s12 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });         // magnet
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 62 — Lava Sprint Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s13[0] - 1, 0.75, s13[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s5a[0], y5a, s5a[2]], width: 6, height: 2, rotation: h5a, gapSide: "right", gapWidth: 1.7 },
    { position: [s11[0], y11, s11[2]], width: 6, height: 2, rotation: h11, gapSide: "left", gapWidth: 1.6 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "center", gapWidth: 1.5 },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s4[0], 1.5, s4[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s6[0], 1.5, s6[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [6, 3, 7],
      direction: [0, 0, -1],
      strength: 12,
    },
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [6, 3, 6],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
