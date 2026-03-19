import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(12);
const s2 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(12);
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(8);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(12);
t.straight(12);
const s7 = t.lastCenter();
const h7 = t.lastHeading();
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(12);
const s9 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 22 — Gatekeeper",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] - 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0], 0.75, s9[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "right", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2.5 },
    { position: [s7[0], 1.5, s7[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 3.0 },
  ],
};

export default level;
