import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(10);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.right(8);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s8 = t.lastCenter();
const h8 = t.lastHeading();
t.straight(8);
const s9 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 29 — Gate and Dash",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0] + 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s9[0], 0.75, s9[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "center", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 3, offTime: 2 },
    { position: [s8[0], 1.5, s8[2]], size: [0.5, 2.5, 6], onTime: 2, offTime: 2.5 },
  ],
};

export default level;
