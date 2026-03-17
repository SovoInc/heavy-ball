import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(10);
t.left(6);
t.straight(12);
const s2 = t.lastCenter();
t.right(6);
t.straight(12);
const s3 = t.lastCenter();
t.left(6);
t.straight(12);
const s4 = t.lastCenter();
t.right(6);
t.straight(10);

const level: LevelData = {
  name: "Level 5 — Zigzag",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.5, 1, 1.5], breakable: true },
    { position: [s4[0], 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
