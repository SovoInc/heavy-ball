import type { LevelData } from "./Level";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

// Tilt demo: platforms slope downhill. Each tilted segment's edges must
// meet the neighbor's height so the ball doesn't hit a step.
// For a platform of depth D tilted by angle T, the center is at y_c,
// the back edge (higher z) is at y_c + sin(T)*D/2, the front edge at y_c - sin(T)*D/2.

const level: LevelData = {
  name: "Level 22 — Tilted",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, -0.5, -58],
    size: [W, 3, 4],
  },
  paths: [
    // Flat start: top at y=0.25, z from -2 to 6
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },
    // Gentle downhill: depth 16, tilt 0.08 rad ≈ 4.6°
    // back edge at z=-2 should be at y≈0 (matching start top)
    // sin(0.08)*8 ≈ 0.64, so center y = 0 - 0.64 = -0.64
    // front edge: -0.64 - 0.64 = -1.28
    { position: [0, -0.64, -10], size: [W, H, 16], noWalls: true, tilt: 0.08 },
    // Flat landing: top at y ≈ -1.28, z from -20 to -26
    { position: [0, -1.28, -23], size: [W, H, 6], noWalls: true },
    // Steeper slope: depth 16, tilt 0.12
    // sin(0.12)*8 ≈ 0.96, center y = -1.28 - 0.96 = -2.24
    // front edge: -2.24 - 0.96 = -3.2
    { position: [0, -2.24, -34], size: [W, H, 16], noWalls: true, tilt: 0.12 },
    // Flat section
    { position: [0, -3.2, -46], size: [W, H, 8], noWalls: true },
    // Finish platform
    { position: [0, -3.2, -56], size: [W, H, 8], noWalls: true },
  ],
};

export default level;
