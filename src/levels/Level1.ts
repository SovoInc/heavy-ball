import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(12);
t.straight(10);
const s2 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10);
const s4 = t.lastCenter();
t.right(8);
t.straight(10);
const s5 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(12);

const level: LevelData = {
  name: "Level 1 — First Roll",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
