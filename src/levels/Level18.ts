import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-6);
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s4 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(8);
const s6 = t.lastCenter();
const h6 = t.lastHeading();
const y6 = t.lastSurfaceY();
t.left(8);
t.straight(6, { surfaceType: SurfaceType.Lava });
t.straight(12);
const s8 = t.lastCenter();
t.straight(10);
const s9 = t.lastCenter();

const level: LevelData = {
  name: "Level 18 — Bounce House",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], s8[1] + 0.5, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s9[0], s9[1] + 0.5, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "center", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [6, 3, 10],
      direction: [1, 0, 0],
      strength: 10,
    },
  ],
};

export default level;
