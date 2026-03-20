import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(12);
t.straight(12);
const s2 = t.lastCenter();
t.left(8);
t.straight(8, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter();
t.straight(12);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.straight(10);
const s6 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Lava });
t.right(8);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(12);
t.straight(10);
const s11 = t.lastCenter();

const level: LevelData = {
  name: "Level 17 — Crosswinds",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s11[0] - 1, 0.75, s11[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "left", gapWidth: 2.2 },
  ],
  windZones: [
    {
      position: [s4[0], s4[1] + 1, s4[2]],
      size: [8, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
  timedGates: [
    { position: [s6[0], 0.25 + 1.25, s6[2]], size: [0.5, 2.5, 6], onTime: 3.0, offTime: 2.0 },
  ],
};

export default level;
