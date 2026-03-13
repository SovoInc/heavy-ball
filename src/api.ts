const BASE = "";

export interface PlayerData {
  id: number;
  alias: string;
}

export interface ScoreEntry {
  rank: number;
  alias: string;
  time_ms: number;
  player_id: number;
}

export interface RunData {
  player_id: number;
  level: number;
  time_ms: number;
  boxes_broken: number;
  power_ups_collected: number;
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

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  registerAlias: (alias: string) =>
    post<PlayerData>("/api/alias", { alias }),

  submitScore: (data: RunData) =>
    post<{ id: number }>("/api/scores", data),

  getTopScores: (level: number, limit = 20) =>
    get<ScoreEntry[]>(`/api/scores/top?level=${level}&limit=${limit}`),

  getPlayerStats: (playerId: number) =>
    get<PlayerStatsData>(`/api/stats/player/${playerId}`),

  unlockAchievement: (playerId: number, achievementKey: string) =>
    post<{ status: string }>("/api/achievements", {
      player_id: playerId,
      achievement_key: achievementKey,
    }),

  getPlayerAchievements: (playerId: number) =>
    get<AchievementEntry[]>(`/api/achievements/${playerId}`),
};
