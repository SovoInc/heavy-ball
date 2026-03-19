import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.straight(10);
t.right(8);
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
t.straight(8, { surfaceType: SurfaceType.Ice });
t.straight(10);
const s7 = t.lastCenter();
t.straight(10);
const s8 = t.lastCenter();

const level: LevelData = {
  name: "Level 10 — Conveyor Belt",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s7[0], 0.75, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
