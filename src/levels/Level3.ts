import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(12);
t.straight(10);
t.left(8);
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(14);
const s5 = t.lastCenter();
t.right(8);
t.straight(14);
const s7 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.left(8);
t.straight(10);
const s10 = t.lastCenter();

const level: LevelData = {
  name: "Level 3 — Gentle Curves",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0] + 1, 0.75, s5[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0] - 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s10[0], 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
