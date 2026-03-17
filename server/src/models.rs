use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct AliasRequest {
    pub alias: String,
}

#[derive(Debug, Serialize)]
pub struct PlayerResponse {
    pub id: i64,
    pub alias: String,
}

#[derive(Debug, Deserialize)]
pub struct ScoreSubmission {
    pub player_id: i64,
    pub level: i64,
    pub time_ms: i64,
    pub boxes_broken: i64,
    pub power_ups_collected: i64,
}

#[derive(Debug, Serialize)]
pub struct ScoreEntry {
    pub rank: i64,
    pub alias: String,
    pub time_ms: i64,
    pub player_id: i64,
}

#[derive(Debug, Serialize)]
pub struct PlayerStats {
    pub total_runs: i64,
    pub total_boxes_broken: i64,
    pub total_power_ups: i64,
    pub levels_completed: i64,
}

#[derive(Debug, Deserialize)]
pub struct AchievementUnlock {
    pub player_id: i64,
    pub achievement_key: String,
}

#[derive(Debug, Serialize)]
pub struct AchievementRecord {
    pub achievement_key: String,
    pub unlocked_at: String,
}

#[derive(Debug, Deserialize)]
pub struct LevelQuery {
    pub level: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct LeaderboardQuery {
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct LeaderboardEntry {
    pub rank: i64,
    pub alias: String,
    pub player_id: i64,
    pub max_level: i64,
    pub total_time_ms: i64,
}

#[derive(Debug, Serialize)]
pub struct PlayerProgress {
    pub max_level: i64,
    pub total_time_ms: i64,
}
