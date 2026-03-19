import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12, { surfaceType: SurfaceType.Ice });
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-6);
t.straight(14);
const s4 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Lava });
t.left(8);
t.straight(10);
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s9 = t.lastCenter();

const level: LevelData = {
  name: "Level 11 — Frozen Chasm",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] - 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2] + 2], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0], s9[1] + 0.5, s9[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 2.2 },
  ],
};

export default level;
