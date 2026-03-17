import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";

// Heading starts at 0 (-Z). After right(8) heading becomes π/2 (+X).
const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.right(8);
// After right turn, heading is π/2, so speed direction is [1,0,0]
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [1, 0, 0] });
const s4 = t.lastCenter();
t.straight(10);
const s5 = t.lastCenter();

const level: LevelData = {
  name: "Level 10 — Conveyor Belt",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0], 0.75, s4[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
};

export default level;
