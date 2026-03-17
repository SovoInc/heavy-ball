import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(12);
const s3 = t.lastCenter();
t.right(8);
t.straight(10);
const s5 = t.lastCenter();

const level: LevelData = {
  name: "Level 8 — Trampoline Park",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, s3[1] + 0.5, s3[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], s5[1] + 0.5, s5[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
