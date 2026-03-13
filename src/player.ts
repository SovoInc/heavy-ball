export interface PlayerState {
  id: number;
  alias: string;
}

const STORAGE_KEY = "heavy_ball_player";

export function getPlayer(): PlayerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setPlayer(player: PlayerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

export function clearPlayer() {
  localStorage.removeItem(STORAGE_KEY);
}
