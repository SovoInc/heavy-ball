const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface PlayerData {
  id: number;
  alias: string;
  wallet_address?: string | null;
  network_id?: string;
  auth_token?: string;
}

export interface ScoreEntry {
  rank: number;
  alias: string;
  display_name?: string;
  wallet_address?: string | null;
  time_ms: number;
  player_id: number;
}

export interface RunData {
  player_id: number;
  level: number;
  time_ms: number;
  boxes_broken: number;
  power_ups_collected: number;
  fall_count: number;
  speed_boosts: number;
}

export interface ScoreResult {
  id: number;
  achievements_unlocked: string[];
  achievements_display: string[];
}

export interface AchievementEntry {
  achievement_key: string;
  unlocked_at: string;
}

export interface PlayerStatsData {
  total_runs: number;
  total_boxes_broken: number;
  total_power_ups: number;
  levels_completed: number;
}

export interface LeaderboardEntry {
  rank: number;
  alias: string;
  display_name?: string;
  wallet_address?: string | null;
  player_id: number;
  max_level: number;
  total_time_ms: number;
}

export interface PlayerProgress {
  max_level: number;
  total_time_ms: number;
}

let _authToken = "";

export function setAuthToken(token: string) {
  _authToken = token;
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (_authToken) h["Authorization"] = `Bearer ${_authToken}`;
  return h;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const h: Record<string, string> = {};
  if (_authToken) h["Authorization"] = `Bearer ${_authToken}`;
  const res = await fetch(`${BASE}${path}`, { headers: h });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function shortenWalletAddress(value: string): string {
  if (value.length <= 14) return value;
  return `${value.slice(0, 3)}...${value.slice(-8)}`;
}

export function getDisplayName(entry: { alias?: string; display_name?: string; wallet_address?: string | null }): string {
  if (entry.wallet_address) return shortenWalletAddress(entry.wallet_address);
  return entry.display_name ?? entry.alias ?? "Unknown";
}

export const api = {
  registerWallet: (walletAddress: string, networkId: string) =>
    post<PlayerData>("/api/wallet", { wallet_address: walletAddress, network_id: networkId }),

  submitScore: (data: RunData) =>
    post<ScoreResult>("/api/scores", data),

  getTopScores: (level: number, limit = 20) =>
    get<ScoreEntry[]>(`/api/scores/top?level=${level}&limit=${limit}`),

  getPlayerStats: (playerId: number) =>
    get<PlayerStatsData>(`/api/stats/player/${playerId}`),

  getPlayerAchievements: (playerId: number) =>
    get<AchievementEntry[]>(`/api/achievements/${playerId}`),

  getLeaderboard: (limit = 20) =>
    get<LeaderboardEntry[]>(`/api/leaderboard?limit=${limit}`),

  getProgress: (playerId: number) =>
    get<PlayerProgress>(`/api/progress/${playerId}`),
};
