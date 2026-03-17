import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);

// First moving platform: heading 0, dx=0, dz=-1
t.z -= 2; // gap before mover
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 1.5, pause: 0.5 } });
t.z -= 2; // gap after mover

t.straight(8);
const s4 = t.lastCenter();

// Second moving platform
t.z -= 2.5; // gap before mover
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2.5, speed: 2, pause: 0.5 } });
t.z -= 2.5; // gap after mover

t.straight(6); // landing pad before turn
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(10);
t.straight(10);
const s8 = t.lastCenter();

const level: LevelData = {
  name: "Level 27 — Shifting Ground",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
};

export default level;
