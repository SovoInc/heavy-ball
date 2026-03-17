import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(12);
t.straight(10);
t.left(8);
t.straight(14);
const s4 = t.lastCenter();
t.right(8);
t.straight(14);
const s6 = t.lastCenter();
t.left(8);
t.straight(10);
const s8 = t.lastCenter();

const level: LevelData = {
  name: "Level 3 — Gentle Curves",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0] - 1, 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
