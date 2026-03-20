import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
const s2 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });             // ice
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s5 = t.lastCenter();
t.straight(10);
const s6 = t.lastCenter();
t.left(8);
// After left turn, heading is back to 0 (-Z)
t.straight(7, { surfaceType: SurfaceType.Lava });           // lava
const s8 = t.lastCenter(); const h8 = t.lastHeading(); const y8 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });      // crumbling
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
const s11 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });          // magnet
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10);

const level: LevelData = {
  name: "Level 66 — Gate Rush",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s11[0], 0.75, s11[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 1.8 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "right", gapWidth: 1.6 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "left", gapWidth: 1.5 },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
    { position: [s5[0], 1.5, s5[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
    { position: [s6[0], 1.5, s6[2]], size: [0.5, 2.5, 6], onTime: 1.5, offTime: 1.5 },
  ],
  windZones: [
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s11[0], s11[1] + 1, s11[2]],
      size: [6, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
};

export default level;
