import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(6, { surfaceType: SurfaceType.Ice });
const s3 = t.lastCenter();
t.straight(10);
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.right(8);
t.straight(6, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(10);
const s8 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.straight(10);

const level: LevelData = {
  name: "Level 12 — Lava and Ice",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] + 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "center", gapWidth: 2.2 },
  ],
};

export default level;
