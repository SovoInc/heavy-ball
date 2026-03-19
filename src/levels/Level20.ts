import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Ice });
t.left(6);
t.straight(6, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.right(6);
t.straight(7, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter();
t.straight(10);
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.left(6);
t.straight(6, { surfaceType: SurfaceType.Ice });
t.straight(10);
const s12 = t.lastCenter();
const h12 = t.lastHeading();
const y12 = t.lastSurfaceY();
t.right(6);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);

const level: LevelData = {
  name: "Level 20 — The Gauntlet",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s8[0] + 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s12[0], 0.75, s12[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "right", gapWidth: 2.0 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "left", gapWidth: 2.0 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "center", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 12,
    },
  ],
};

export default level;
