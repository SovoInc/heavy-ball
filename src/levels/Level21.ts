import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth; // 6
const H = 0.5;
const R = 8; // curve radius

// Course: straight → right turn → straight → right turn → straight to finish
//
// Math note for XZ plane (Y up):
//   CCW in math (+arcAngle) = CW from top-down view = "right turn"
//   At angle θ, position = (cx + R·cosθ, cz + R·sinθ)
//   CCW tangent at θ: (-sinθ, cosθ) in (x,z)

// Seg A: Straight heading -Z at x=0, from z=6 to z=-6
// Curve 1: right turn -Z→+X, center (R, 0, -6), entry at θ=π → (0,-6), exit at θ=3π/2 → (R, -6-R)=(8,-14)
//   CCW tangent at 3π/2: (1, 0) → heading +X ✓
// Seg B: Straight heading +X at z=-14, from x=8 to x=20
// Curve 2: right turn +X→-Z, center (20, 0, -14-R)=(20,0,-22)
//   entry at θ=π/2 → (20, -14), CW (arcAngle=-π/2)
//   exit at θ=0 → (28, -22), CW tangent at 0: (0,-1) → heading -Z ✓
// Seg C: Straight heading -Z at x=28, from z=-22 to z=-38

const level: LevelData = {
  name: "Level 21 — Winding Road",
  startPosition: [0, 2, 2],
  finishZone: {
    position: [R + 20, 1.5, -36],
    size: [W, 3, 4],
  },
  paths: [
    // A: Start area heading -Z
    { position: [0, 0, 0], size: [W, H, 12], noWalls: true },
    // B: After first right turn, heading +X
    { position: [R + 6, 0, -(6 + R)], size: [12, H, W], noWalls: true },
    // C: After second right turn, heading -Z to finish
    { position: [R + 20, 0, -(R + 14 + 8)], size: [W, H, 16], noWalls: true },
  ],
  curvedPaths: [
    // Right turn: -Z → +X
    {
      center: [R, 0, -6],
      radius: R,
      trackWidth: W,
      height: H,
      startAngle: Math.PI,
      arcAngle: Math.PI / 2,

    },
    // Right turn: +X → -Z (ice)
    {
      center: [20, 0, -(6 + R + R)],
      radius: R,
      trackWidth: W,
      height: H,
      startAngle: Math.PI / 2,
      arcAngle: -Math.PI / 2,
      surfaceType: SurfaceType.Ice,

    },
  ],
};

export default level;
