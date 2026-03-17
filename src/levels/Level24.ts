import type { LevelData } from "./Level";
import { TrackBuilder } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
const y2 = t.lastSurfaceY();
t.straight(14);
const s3 = t.lastCenter();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(14);
const s5 = t.lastCenter();
t.straight(10);
const s6 = t.lastCenter();
const y6 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 24 — Warp Zone",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  teleportPairs: [
    { a: [s2[0], y2, s2[2]], b: [s6[0], y6, s6[2]] },
  ],
};

export default level;
