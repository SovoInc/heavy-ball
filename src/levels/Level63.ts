import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.right(6);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(6);
// After left turn, heading is back to 0 (-Z)
t.straight(7, { surfaceType: SurfaceType.Lava });         // lava
const s5a = t.lastCenter(); const h5a = t.lastHeading(); const y5a = t.lastSurfaceY();
t.straight(6);
const s6 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(6, { surfaceType: SurfaceType.Ice });           // ice
const s8a = t.lastCenter();
t.straight(6);
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s12 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });        // magnet
const s13 = t.lastCenter(); const h13 = t.lastHeading(); const y13 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 63 — Crumble Chain",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0] + 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s13[0] - 1, 0.75, s13[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 1.7 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "left", gapWidth: 1.6 },
    { position: [s13[0], y13, s13[2]], width: 6, height: 2, rotation: h13, gapSide: "center", gapWidth: 1.5 },
  ],
  timedGates: [
    { position: [s5a[0], 1.5, s5a[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
  windZones: [
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 6],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [6, 3, 6],
      direction: [-1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
