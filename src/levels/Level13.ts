import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(10, { surfaceType: SurfaceType.Crumbling });
t.straight(8);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.left(8);
t.straight(6, { surfaceType: SurfaceType.Ice });
t.straight(12);
const s8 = t.lastCenter();
t.straight(8);
const s9 = t.lastCenter();

const level: LevelData = {
  name: "Level 13 — Crumble Sprint",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "right", gapWidth: 2.0 },
  ],
};

export default level;
