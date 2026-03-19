import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);
t.straight(10, { surfaceType: SurfaceType.Magnet });
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(7, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
t.straight(10);
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.right(6);
// After right turn, heading is back to 0 (-Z)
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s7 = t.lastCenter();
t.straight(8);
const s8 = t.lastCenter();
const h8 = t.lastHeading();
const y8 = t.lastSurfaceY();
t.left(6);
// After left turn, heading is -π/2 (-X)
t.straight(12, { surfaceType: SurfaceType.Magnet });
const s10 = t.lastCenter();
t.straight(10);
const s11 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Ice });
const s12 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 2.5, offTime: 1.5 } });
t.straight(10);

const level: LevelData = {
  name: "Level 39 — The Labyrinth",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s8[0] - 1, 0.75, s8[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0], 0.75, s10[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s11[0], 0.75, s11[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s12[0], 0.75, s12[2] - 1], size: [1.2, 1, 1.2], breakable: true },
  ],
  latticeWalls: [
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "right", gapWidth: 2.0 },
    { position: [s8[0], y8, s8[2]], width: 6, height: 2, rotation: h8, gapSide: "left", gapWidth: 1.8 },
  ],
  windZones: [
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [6, 3, 10],
      direction: [1, 0, 0],
      strength: 10,
    },
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [8, 3, 6],
      direction: [0, 0, 1],
      strength: 8,
    },
  ],
  timedGates: [
    { position: [s4[0], 0.75 + 1.25, s4[2]], size: [0.5, 2.5, 6], onTime: 2.0, offTime: 2.0 },
  ],
};

export default level;
