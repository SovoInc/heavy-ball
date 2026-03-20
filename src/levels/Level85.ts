import type { LevelData } from "./Level";
import { TrackBuilder, SurfaceType } from "./levelHelpers";
import { PowerUpType } from "../powerups/PowerUpType";

const t = new TrackBuilder();
t.straight(10);                                                               // safe start
t.straight(12);
const s2 = t.lastCenter(); const h2 = t.lastHeading(); const y2 = t.lastSurfaceY();

// Moving platform 1: heading 0 → Z-axis
t.z -= 2; // gap before
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 1.5, pause: 0.5 } });
t.z -= 2; // gap after

t.straight(10, { surfaceType: SurfaceType.Ice });
const s4 = t.lastCenter(); const h4 = t.lastHeading(); const y4 = t.lastSurfaceY();
t.right(8);                                                                   // curve 1 → heading π/2
t.straight(14, { surfaceType: SurfaceType.Ice });
const s6 = t.lastCenter(); const h6 = t.lastHeading(); const y6 = t.lastSurfaceY();
t.straight(10);
const s7 = t.lastCenter();
t.straight(7, { surfaceType: SurfaceType.Lava });
const s7b = t.lastCenter(); const h7b = t.lastHeading(); const y7b = t.lastSurfaceY();
t.left(8);                                                                    // curve 2 → heading 0
t.straight(12, { surfaceType: SurfaceType.Crumbling });
const s9 = t.lastCenter(); const h9 = t.lastHeading(); const y9 = t.lastSurfaceY();

// Moving platform 2: heading 0 → Z-axis
t.z -= 2; // gap before
t.straight(8, { platformMoving: { axis: [0, 0, 1], range: 2, speed: 2.0, pause: 0.5 } });
t.z -= 2; // gap after

t.straight(6);                                                                // landing pad before turn
t.left(6);                                                                    // curve 3 → heading -π/2
t.straight(14, { surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 1.5 } });
const s12 = t.lastCenter(); const h12 = t.lastHeading(); const y12 = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Speed, direction: [-1, 0, 0] });
const s12b = t.lastCenter();
t.right(8);                                                                   // curve 4 → heading 0
t.straight(12, { surfaceType: SurfaceType.Bounce });
t.straight(7, { surfaceType: SurfaceType.Lava });
const s14b = t.lastCenter(); const h14b = t.lastHeading(); const y14b = t.lastSurfaceY();
t.straight(10, { surfaceType: SurfaceType.Crumbling });
const s14c = t.lastCenter();
t.straight(10);

const level: LevelData = {
  name: "Level 85 — Pendulum Passage",
  startPosition: t.startPos(),
  finishZone: t.finish(),
  ...t.build(),
  obstacles: [
    { position: [s4[0] + 1, 0.75, s4[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
    { position: [s7[0], 0.75, s7[2] - 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeBonus },
    { position: [s9[0] - 1, 0.75, s9[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.SpeedBoost },
    { position: [s12b[0], 0.75, s12b[2] + 1], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.TimeFreeze },
    { position: [s14c[0] + 1, 0.75, s14c[2]], size: [1.2, 1, 1.2], breakable: true, powerUp: PowerUpType.Shield },
  ],
  latticeWalls: [
    { position: [s2[0], y2, s2[2]], width: 6, height: 2, rotation: h2, gapSide: "right", gapWidth: 1.5 },
    { position: [s6[0], y6, s6[2]], width: 6, height: 2, rotation: h6, gapSide: "left", gapWidth: 1.5 },
    { position: [s9[0], y9, s9[2]], width: 6, height: 2, rotation: h9, gapSide: "center", gapWidth: 1.5 },
    { position: [s12[0], y12, s12[2]], width: 6, height: 2, rotation: h12, gapSide: "right", gapWidth: 1.5 },
    { position: [s14b[0], y14b, s14b[2]], width: 6, height: 2, rotation: h14b, gapSide: "left", gapWidth: 1.5 },
  ],
  windZones: [
    {
      position: [s7b[0], s7b[1] + 1, s7b[2]],
      size: [7, 3, 6],
      direction: [0, 0, 1],
      strength: 15,
    },
    {
      position: [s12[0], s12[1] + 1, s12[2]],
      size: [14, 3, 6],
      direction: [0, 0, -1],
      strength: 14,
    },
    {
      position: [s14b[0], s14b[1] + 1, s14b[2]],
      size: [6, 3, 7],
      direction: [1, 0, 0],
      strength: 16,
    },
  ],
  timedGates: [
    { position: [s4[0], 1.5, s4[2]], size: [6, 2.5, 0.5], onTime: 2.0, offTime: 1.5 },
    { position: [s9[0], 1.5, s9[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 2.0 },
    { position: [s14c[0], 1.5, s14c[2]], size: [6, 2.5, 0.5], onTime: 1.5, offTime: 1.5 },
  ],
};

export default level;
