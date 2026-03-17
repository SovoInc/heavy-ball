import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(14);
t.straight(14);
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();
t.right(8);
// After right turn, heading is π/2 (+X)
t.straight(8, { surfaceType: SurfaceType.Lava });
t.straight(14);
const s5 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(14);
const s7 = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 16 — Trial by Fire",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7[0], 0.75, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "center", gapWidth: 2.5 },
  ],
};

export default level;
