import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 1.5 } });
t.straight(6);
const s3 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
t.straight(8, { surfaceType: SurfaceType.Crumbling });
t.left(8);
t.straight(7, { surfaceType: SurfaceType.Lava });
t.straight(12);
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 25 — Now You See Me",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s3[0] - 1, 0.75, s3[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s8[0], 0.75, s8[2] + 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "center", gapWidth: 2.0 },
  ],
};

export default level;
