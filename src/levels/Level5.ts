import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(10);
t.left(6);
t.straight(8);
const s3 = t.lastCenter();
t.right(6);
t.straight(8);
const s5 = t.lastCenter();
t.left(6);
t.straight(10);

const level: LevelData = {
  name: "Level 5 — The S-Bend",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0] - 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
