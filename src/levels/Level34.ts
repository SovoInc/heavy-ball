import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(6);
const s3 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });

// Moving platform: heading is 0, dx=0, dz=-1
t.z -= 1.5; // gap before mover
t.straight(6, { platformMoving: { axis: [0, 0, 1], range: 1.5, speed: 2, pause: 0.5 } });
t.z -= 1.5; // gap after mover

t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s9 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(6, { surfaceType: SurfaceType.Magnet });
const s11 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 34 — Crumble Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s8[0] + 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s11[0] - 1, 0.75, s11[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 1.5 },
    { position: [s8[0], y8 + 1.25, s8[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 2.0 },
  ],
  latticeWalls: [
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "right", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s9[0], s9[1] + 1, s9[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
