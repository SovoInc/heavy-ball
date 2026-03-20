import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(6);
const s3 = t.lastCenter();
const h3 = t.lastHeading();
const y3 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
t.straight(6);
const s5 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter();
t.straight(12);
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s10 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 37 — Phase Shift",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s5[0] + 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s10[0], 0.75, s10[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2, offTime: 3 },
    { position: [s8[0], 0.25 + 1.25, s8[2]], size: [0.5, 2.5, 6], onTime: 2.5, offTime: 2 },
  ],
  latticeWalls: [
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "left", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [7, 3, 6],
      direction: [0, 0, 1],
      strength: 10,
    },
  ],
};

export default level;
