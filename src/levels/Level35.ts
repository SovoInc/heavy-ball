import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s3 = t.lastCenter();

// Moving platform: heading is 0, dx=0, dz=-1
t.z -= 2; // gap before mover
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 1.5, pause: 0.5 } });
t.z -= 2; // gap after mover

t.straight(6); // landing pad before turn
t.left(8);
// After left turn, heading is -π/2 (-X)
t.straight(12);
const s6 = t.lastCenter();
t.straight(10);
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Ice });
const s8 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s9 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 35 — Lava Bridge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s6[0], 0.75, s6[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7[0], 0.75, s7[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 8,
    },
    {
      position: [s8[0], s8[1] + 1, s8[2]],
      size: [8, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
  latticeWalls: [
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [s9[0], 0.25 + 1.25, s9[2]], size: [0.5, 2.5, 6], onTime: 2.5, offTime: 2 },
  ],
};

export default level;
