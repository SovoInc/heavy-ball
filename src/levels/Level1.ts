import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(12);
t.straight(12);
const s2 = t.lastCenter();
t.straight(12);
const s3 = t.lastCenter();
t.right(8);
t.straight(12);
t.straight(12);

const level: LevelData = {
  name: "Level 1 — First Roll",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
