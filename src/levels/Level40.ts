import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(8, { surfaceType: SurfaceType.Ice });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(10);
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Lava });
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(6, { surfaceType: SurfaceType.Bounce });
t.drop(-6);
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s9 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Speed, direction: [0, 0, -1] });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(8, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 2 } });
const s12 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s13 = t.lastCenter();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10);
const s15 = t.lastCenter();
t.straight(10);
const s16 = t.lastCenter();
const y16 = t.lastSurfaceY();
t.straight(10);
const s17 = t.lastCenter();
const y17 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 40 — Chapter's End",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s9[0] + 1, s9[1] + 0.5, s9[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s13[0], 0.75, s13[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s15[0] - 1, s15[1] + 0.5, s15[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s16[0] + 1, s16[1] + 0.5, s16[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s17[0] - 1, s17[1] + 0.5, s17[2]], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "center", gapWidth: 2.0 },
  ],
  timedGates: [
    { position: [s15[0], 1.5 + s15[1], s15[2]], size: [6, 2.5, 0.5], onTime: 2.5, offTime: 2 },
  ],
  windZones: [
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [16, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
  teleportPairs: [
    { a: [s16[0], y16, s16[2]], b: [s17[0], y17, s17[2]] },
  ],
};

export default level;
