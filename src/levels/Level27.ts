import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Ice });

// First moving platform: heading 0, dx=0, dz=-1
t.z -= 2; // gap before mover
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 1.5, pause: 0.5 } });
t.z -= 2; // gap after mover

t.straight(8);
const s4 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });

// Second moving platform
t.z -= 2.5; // gap before mover
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2.5, speed: 2, pause: 0.5 } });
t.z -= 2.5; // gap after mover

t.straight(6);
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.right(8);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
t.straight(10);
const s11 = t.lastCenter();

const level: LevelData = {
  name: "Level 27 — Shifting Ground",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s11[0], 0.75, s11[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 2.0 },
  ],
};

export default level;
