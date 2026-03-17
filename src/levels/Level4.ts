import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(12);
t.straight(12);
const s2 = t.lastCenter();
t.left(8);
t.straight(12);
const s3 = t.lastCenter();
t.straight(12);
const s4 = t.lastCenter();
t.right(8);
t.straight(12);
const s5 = t.lastCenter();
t.straight(12);

const level: LevelData = {
  name: "Level 4 — Fenced Run",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] - 1.5, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2]], size: [1.5, 1, 1], breakable: true },
  ],
  latticeWalls: [
    { position: [s3[0], 1, s3[2]], width: 6, height: 2, gapSide: "left", gapWidth: 2.5 },
  ],
};

export default level;
