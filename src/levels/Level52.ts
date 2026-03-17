import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                 // safe start
t.straight(8);
const s2 = t.lastCenter();

// Moving platform 1 — heading 0 (Z-axis mover)
t.z -= 2;
t.straight(4, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 2, pause: 0.5 } });
t.z -= 2;

t.straight(8);
t.left(6);                     // curve 1 → heading -π/2

t.straight(6);                 // landing pad before mover 2

// Moving platform 2 — heading -π/2, use X-axis mover
// At heading -π/2: dx=-1, dz=0
t.x -= 2;
t.straight(4, { platformMoving: { axis: [1, 0, 0], range: 2, speed: 2.5, pause: 0.5 } });
t.x -= 2;

t.straight(6);                 // landing pad after mover 2
const s5 = t.lastCenter();
t.right(6);                    // curve 2 → heading 0

t.straight(6);                 // landing pad before mover 3

// Moving platform 3 — heading 0 (Z-axis mover)
t.z -= 1;
t.straight(4, { platformMoving: { axis: [0, 0, 1], range: 1, speed: 2, pause: 0.5 } });
t.z -= 1;

t.straight(10);

const level: LevelData = {
  name: "Level 52 — Moving Target",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
  ],
};

export default level;
