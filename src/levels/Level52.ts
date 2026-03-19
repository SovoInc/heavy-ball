import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                 // safe start
t.straight(8, { surfaceType: SurfaceType.Ice });
const s2 = t.lastCenter();
const h2 = t.lastHeading();
const y2 = t.lastSurfaceY();

// Moving platform 1 — heading 0 (Z-axis mover)
t.z -= 2;
t.straight(4, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 2, pause: 0.5 } });
t.z -= 2;

t.straight(7, { surfaceType: SurfaceType.Lava });
const s4 = t.lastCenter();
const h4 = t.lastHeading();
const y4 = t.lastSurfaceY();
t.left(6);                     // curve 1 → heading -π/2

t.straight(6, { surfaceType: SurfaceType.Crumbling });
const s5a = t.lastCenter();

// Moving platform 2 — heading -π/2, use X-axis mover
t.x -= 2;
t.straight(4, { platformMoving: { axis: [1, 0, 0], range: 2, speed: 2.5, pause: 0.5 } });
t.x -= 2;

t.straight(6, { surfaceType: SurfaceType.Ice });
const s5 = t.lastCenter();
const h5 = t.lastHeading();
const y5 = t.lastSurfaceY();
t.right(6);                    // curve 2 → heading 0

t.straight(6, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 1.5, offTime: 1.5 } });
const s7 = t.lastCenter();

// Moving platform 3 — heading 0 (Z-axis mover)
t.z -= 1;
t.straight(4, { platformMoving: { axis: [0, 0, 1], range: 1, speed: 2, pause: 0.5 } });
t.z -= 1;

t.straight(7, { surfaceType: SurfaceType.Lava });
const s9 = t.lastCenter();
const h9 = t.lastHeading();
const y9 = t.lastSurfaceY();
t.straight(10);

const level: LevelData = {
  name: "Level 52 — Moving Target",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s2[0] + 1, 0.75, s2[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s5[0], 0.75, s5[2] + 1], size: [1.2, 1, 1.2], breakable: true },
    { position: [s5[0], 0.75, s5[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s7[0] - 1, 0.75, s7[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s4[0], y4, s4[2]], width: 6, height: 2, rotation: h4, gapSide: "center", gapWidth: 1.8 },
    { position: [s5[0], y5, s5[2]], width: 6, height: 2, rotation: h5, gapSide: "right", gapWidth: 1.6 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "left", gapWidth: 1.7 },
  ],
  windZones: [
    {
      position: [s5a[0], s5a[1] + 1, s5a[2]],
      size: [6, 3, 6],
      direction: [0, 0, -1],
      strength: 12,
    },
  ],
};

export default level;
