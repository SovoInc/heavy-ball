import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                          // safe start
t.straight(7, { surfaceType: SurfaceType.Lava });        // lava stretch (capped at 7)
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Ice });         // ice after lava
const s3 = t.lastCenter();
t.left(6);                                               // curve 1
t.straight(8);
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.straight(8, { surfaceType: SurfaceType.Crumbling });
const s5a = t.lastCenter();
t.right(6);                                              // curve 2
t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s6 = t.lastCenter();
t.straight(8, { surfaceType: SurfaceType.Magnet });
const s7 = t.lastCenter(); const h7 = t.lastHeading(); const y7 = t.lastSurfaceY();
t.left(6);                                               // curve 3
t.straight(7, { surfaceType: SurfaceType.Lava });        // second lava
const s9 = t.lastCenter();
t.straight(6, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
t.right(6);                                              // curve 4
t.straight(10);

const level: LevelData = {
  name: "Level 55 — Lava Lattice",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s5a[0] - 1, 0.75, s5a[2]], size: [1.2, 1, 1.2], breakable: true },
    { position: [s7[0] + 1, 0.75, s7[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0], 0.75, s9[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.8 },
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "left", gapWidth: 1.7 },
    { position: [s7[0], y7, s7[2]], width: 6, height: 2, rotation: h7, gapSide: "center", gapWidth: 1.6 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 8],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s6[0], s6[1] + 1, s6[2]],
      size: [6, 3, 6],
      direction: [0, 0, -1],
      strength: 10,
    },
  ],
};

export default level;
