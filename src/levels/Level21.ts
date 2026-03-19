import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(14);
const s3 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(14);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.right(8);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(12);
const s8 = t.lastCenter();
t.straight(10);
const s9 = t.lastCenter();

const level: LevelData = {
  name: "Level 21 — Windy Meadow",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "center", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2] - 7],
      size: [6, 3, 28],
      direction: [1, 0, 0],
      strength: 8,
    },
  ],
};

export default level;
