export interface ProceduralBackgroundTheme {
  id: "procedural-starfield";
  name: string;
  kind: "procedural";
}

export interface ScenicBackgroundTheme {
  id: string;
  name: string;
  kind: "scenic";
  asset: string;
}

export type BackgroundTheme = ProceduralBackgroundTheme | ScenicBackgroundTheme;

export const BACKGROUND_THEMES: readonly BackgroundTheme[] = [
  { id: "procedural-starfield", name: "Original Starfield", kind: "procedural" },
  { id: "neon-harbor", name: "Neon Harbor", kind: "scenic", asset: "neon-harbor" },
  { id: "frost-citadel", name: "Frost Citadel", kind: "scenic", asset: "frost-citadel" },
  { id: "verdant-arcology", name: "Verdant Arcology", kind: "scenic", asset: "verdant-arcology" },
  { id: "violet-rift", name: "Violet Rift", kind: "scenic", asset: "violet-rift" },
  { id: "ember-bastion", name: "Ember Bastion", kind: "scenic", asset: "ember-bastion" },
];

export function pickBackgroundTheme(random: () => number = Math.random): BackgroundTheme {
  const value = Math.max(0, Math.min(random(), 0.999999999));
  return BACKGROUND_THEMES[Math.floor(value * BACKGROUND_THEMES.length)];
}

export function findBackgroundTheme(id: string | null): BackgroundTheme | undefined {
  return BACKGROUND_THEMES.find((theme) => theme.id === id);
}
