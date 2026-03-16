import type { LevelData } from "./Level";

// Vite eager glob: imports all Level{N}.ts files at build time.
// Level data is inlined into the bundle — not editable in production.
const modules = import.meta.glob<{ default: LevelData }>(
  "./Level[0-9]*.ts",
  { eager: true },
);

function levelNumber(path: string): number {
  const match = path.match(/Level(\d+)\.ts$/);
  return match ? parseInt(match[1], 10) : 0;
}

export const ALL_LEVELS: LevelData[] = Object.entries(modules)
  .sort(([a], [b]) => levelNumber(a) - levelNumber(b))
  .map(([, mod]) => mod.default);
