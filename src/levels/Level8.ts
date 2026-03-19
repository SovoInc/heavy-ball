import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(10);
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-4);
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(12);
const s4 = t.lastCenter();
t.right(8);
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);
const s6 = t.lastCenter();

const level: LevelData = {
  name: "Level 8 — Trampoline Park",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, s4[1] + 0.5, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], s6[1] + 0.5, s6[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
