import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Ice });
t.left(6);
t.straight(6);
const s4 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s5 = t.lastCenter();
t.right(6);
t.straight(10);
const s7 = t.lastCenter();
const h7 = t.lastHeading();
const y7 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Ice });
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s10 = t.lastCenter();

const level: LevelData = {
  name: "Level 15 — Slippery Slope",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0], 0.75, s4[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s10[0] - 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s10[0] + 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "left", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s5[0], s5[1] + 1, s5[2]],
      size: [7, 3, 6],
      direction: [0, 0, -1],
      strength: 8,
    },
  ],
};

export default level;
