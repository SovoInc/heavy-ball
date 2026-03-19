import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(10, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3.5, offTime: 2 } });
t.straight(8);
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s6 = t.lastCenter();
t.straight(12);
const s7 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Ice });
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 31 — Invisible Bridge",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s6[0], s6[1] + 0.5, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0], s7[1] + 0.5, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s9[0], s9[1] + 0.5, s9[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "center", gapWidth: 2.0 },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [12, 3, 6],
      direction: [0, 0, 1],
      strength: 10,
    },
  ],
  timedGates: [
    { position: [s9[0], s9[1] + 1.25, s9[2]], size: [0.5, 2.5, 6], onTime: 2.5, offTime: 2 },
  ],
};

export default level;
