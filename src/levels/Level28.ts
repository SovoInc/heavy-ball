import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(12);
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(8);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s7 = t.lastCenter();
t.straight(10);
const s8 = t.lastCenter();

const level: LevelData = {
  name: "Level 28 — Wind Tunnel",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] - 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s7[0], 0.75, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s2[0], s2[1] + 1, s2[2]],
      size: [6, 3, 12],
      direction: [0, 0, 1],
      strength: 12,
    },
  ],
};

export default level;
