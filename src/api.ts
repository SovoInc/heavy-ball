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
  fire_maxed: boolean;
  ice_maxed: boolean;
}

export interface SessionResponse {
  session_token: string;
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

function base64url(data: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signScoreJWT(payload: RunData, secret: string): Promise<string> {
  const header = base64url('{"alg":"HS256","typ":"JWT"}');
  const body = base64url(JSON.stringify(payload));
  const message = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return `${message}.${base64url(sig)}`;
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
  if (value.length <= 24) return value;
  return `${value.slice(0, 16)}...${value.slice(-8)}`;
}

export function getDisplayName(entry: { alias?: string; display_name?: string; wallet_address?: string | null }): string {
  if (entry.wallet_address) return shortenWalletAddress(entry.wallet_address);
  return entry.display_name ?? entry.alias ?? "Unknown";
}

export const api = {
  registerWallet: (walletAddress: string, networkId: string) =>
    post<PlayerData>("/api/wallet", { wallet_address: walletAddress, network_id: networkId }),

  startSession: (playerId: number, level: number) =>
    post<SessionResponse>("/api/session/start", { player_id: playerId, level }),

  submitScore: async (data: RunData, sessionToken: string): Promise<ScoreResult> => {
    const scoreToken = await signScoreJWT(data, sessionToken);
    return post<ScoreResult>("/api/scores", { session_token: sessionToken, score_token: scoreToken });
  },

  getTopScores: (level: number, limit = 20, networkId?: string) =>
    get<ScoreEntry[]>(`/api/scores/top?level=${level}&limit=${limit}${networkId ? `&network_id=${networkId}` : ""}`),

  getPlayerStats: (playerId: number) =>
    get<PlayerStatsData>(`/api/stats/player/${playerId}`),

  getPlayerAchievements: (playerId: number) =>
    get<AchievementEntry[]>(`/api/achievements/${playerId}`),

  getLeaderboard: (limit = 20, networkId?: string) =>
    get<LeaderboardEntry[]>(`/api/leaderboard?limit=${limit}${networkId ? `&network_id=${networkId}` : ""}`),

  getProgress: (playerId: number) =>
    get<PlayerProgress>(`/api/progress/${playerId}`),
};
