import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(10);
t.straight(10);
const s2 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10);
const s4 = t.lastCenter();
t.left(8);
t.straight(10);
const s6 = t.lastCenter();
t.straight(10);
const s7 = t.lastCenter();
t.straight(10);
const s8 = t.lastCenter();

const level: LevelData = {
  name: "Level 2 — Icy Turn",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] - 1.5, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s4[0] + 1.5, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s6[0], 0.75, s6[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0] - 1.5, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0] + 1.5, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
