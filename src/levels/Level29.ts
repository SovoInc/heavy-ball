import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
t.straight(10, { surfaceType: SurfaceType.Lava });
t.straight(10);
const s4 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10);
const s6 = t.lastCenter();
const h6 = t.lastHeading();
t.straight(8);
const s7 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 29 — Gate and Dash",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s7[0], 0.75, s7[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
  timedGates: [
    { position: [s2[0], 1.5, s2[2]], size: [6, 2.5, 0.5], onTime: 3, offTime: 2 },
    { position: [s6[0], 1.5, s6[2]], size: [0.5, 2.5, 6], onTime: 2, offTime: 2.5 },
  ],
};

export default level;
