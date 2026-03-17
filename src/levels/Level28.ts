import type { LevelData } from "./Level";
import { SurfaceType } from "../objects/Path";
import { CONFIG } from "../config";

const W = CONFIG.path.wideWidth;
const H = 0.5;

const level: LevelData = {
  name: "Level 28 — Now You See Me",
  startPosition: [0, 2, 0],
  finishZone: {
    position: [0, 1.5, -38],
    size: [W, 3, 4],
  },
  paths: [
    // Start: z=-2 to z=6
    { position: [0, 0, 2], size: [W, H, 8], noWalls: true },
    // Invisible (generous): z=-10 to z=-2
    { position: [0, 0, -6], size: [W, H, 8], noWalls: true,
      surfaceType: SurfaceType.Invisible, invisible: { onTime: 5, offTime: 2 } },
    // Safe: z=-16 to z=-10
    { position: [0, 0, -13], size: [W, H, 6], noWalls: true },
    // Invisible (medium): z=-22 to z=-16
    { position: [0, 0, -19], size: [W, H, 6], noWalls: true,
      surfaceType: SurfaceType.Invisible, invisible: { onTime: 4, offTime: 2.5 } },
    // Safe: z=-26 to z=-22
    { position: [0, 0, -24], size: [W, H, 4], noWalls: true },
    // Invisible (harder): z=-30 to z=-26
    { position: [0, 0, -28], size: [W, H, 4], noWalls: true,
      surfaceType: SurfaceType.Invisible, invisible: { onTime: 3, offTime: 3 } },
    // Finish: z=-36 to z=-30
    { position: [0, 0, -33], size: [W, H, 6], noWalls: true },
  ],
};

export default level;
