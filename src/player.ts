export interface PlayerState {
  id: number;
  alias: string;
  wallet_address?: string | null;
  network_id?: string;
  auth_token?: string;
}

const STORAGE_KEY = "heavy_ball_player";
const AUTH_TOKEN_KEY = "hb_auth_token";

export function getPlayer(): PlayerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const player = JSON.parse(raw) as PlayerState;
    // Restore auth token from separate key
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) player.auth_token = token;
    return player;
  } catch {
    return null;
  }
}

export function setPlayer(player: PlayerState) {
  // Store auth token separately so it doesn't get lost on player updates
  if (player.auth_token) {
    localStorage.setItem(AUTH_TOKEN_KEY, player.auth_token);
  }
  const { auth_token: _, ...rest } = player;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

export function clearPlayer() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
