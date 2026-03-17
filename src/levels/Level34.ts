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

const level: LevelData = {
  name: "Level 34 — Crumble Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s8[0] + 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  timedGates: [
    { position: [s3[0], 1.5, s3[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 1.5 },
  ],
};

export default level;
