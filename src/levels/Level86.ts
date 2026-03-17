import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(10);
const s2 = t.lastCenter();
t.straight(14, { surfaceType: SurfaceType.Lava });
const s3 = t.lastCenter(); const h3 = t.lastHeading(); const y3 = t.lastSurfaceY();
t.straight(10);
const s4 = t.lastCenter();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(12);
const s6 = t.lastCenter();
t.straight(16, { surfaceType: SurfaceType.Lava });
const s7 = t.lastCenter();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(10);
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();
t.straight(14, { surfaceType: SurfaceType.Lava });
const s10 = t.lastCenter();
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(12);
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(10);
t.straight(8);

// ~10+10+14+10+12.6+12+16+12.6+10+14+9.4+12+12.6+10+8 = ~183.2

const level: LevelData = {
  name: "Level 86 — The Furnace",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] - 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s6[0], 0.75, s6[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s10[0] + 1, 0.75, s10[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s3[0], y3, s3[2]], width: 6, height: 2, rotation: h3, gapSide: "center", gapWidth: 1.5 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "left", gapWidth: 1.8 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "right", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s3[0], s3[1] + 1, s3[2]],
      size: [6, 3, 14],
      direction: [1, 0, 0],
      strength: 12,
    },
    {
      position: [s7[0], s7[1] + 1, s7[2]],
      size: [6, 3, 16],
      direction: [0, 0, -1],
      strength: 10,
    },
    {
      position: [s10[0], s10[1] + 1, s10[2]],
      size: [6, 3, 14],
      direction: [-1, 0, 0],
      strength: 14,
    },
  ],
};

export default level;
