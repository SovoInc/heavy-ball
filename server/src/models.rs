use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct WalletRequest {
    pub wallet_address: String,
    pub network_id: String,
}

#[derive(Debug, Serialize)]
pub struct PlayerResponse {
    pub id: i64,
    pub alias: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub network_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth_token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SessionStartRequest {
    pub player_id: i64,
    pub level: i64,
}

#[derive(Debug, Serialize)]
pub struct SessionStartResponse {
    pub session_token: String,
}

#[derive(Debug, Deserialize)]
pub struct ScoreSubmission {
    pub session_token: String,
    pub score_token: String,
}

/// The score data inside the client-signed JWT.
#[derive(Debug, Deserialize)]
pub struct ScorePayload {
    pub player_id: i64,
    pub level: i64,
    pub time_ms: i64,
    pub boxes_broken: i64,
    pub power_ups_collected: i64,
    pub fall_count: i64,
    pub speed_boosts: i64,
    #[serde(default)]
    pub fire_maxed: bool,
    #[serde(default)]
    pub ice_maxed: bool,
}

#[derive(Debug, Serialize)]
pub struct ScoreResult {
    pub id: i64,
    pub achievements_unlocked: Vec<String>,
    pub achievements_display: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct ScoreEntry {
    pub rank: i64,
    pub alias: String,
    pub display_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
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

#[derive(Debug, Serialize)]
pub struct AchievementRecord {
    pub achievement_key: String,
    pub unlocked_at: String,
}

#[derive(Debug, Deserialize)]
pub struct LevelQuery {
    pub level: Option<i64>,
    pub limit: Option<i64>,
    pub network_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LeaderboardQuery {
    pub limit: Option<i64>,
    pub network_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct LeaderboardEntry {
    pub rank: i64,
    pub alias: String,
    pub display_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
    pub player_id: i64,
    pub max_level: i64,
    pub total_time_ms: i64,
}

#[derive(Debug, Serialize)]
pub struct PlayerProgress {
    pub max_level: i64,
    pub total_time_ms: i64,
}

// --- Metrics API types (PRC-6) ---

#[derive(Debug, Serialize)]
pub struct MetricsResponse {
    pub name: String,
    pub description: String,
    pub achievements: Vec<MetricAchievement>,
    pub channels: Vec<ChannelDef>,
}

#[derive(Debug, Serialize)]
pub struct MetricAchievement {
    pub name: String,
    #[serde(rename = "displayName")]
    pub display_name: String,
    pub description: String,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    pub score: i64,
    pub category: String,
    #[serde(rename = "percentCompleted", skip_serializing_if = "Option::is_none")]
    pub percent_completed: Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct ChannelDef {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "scoreUnit")]
    pub score_unit: String,
    #[serde(rename = "sortOrder")]
    pub sort_order: String,
}

#[derive(Debug, Deserialize)]
pub struct ChannelQuery {
    #[serde(rename = "startDate")]
    pub start_date: Option<String>,
    #[serde(rename = "endDate")]
    pub end_date: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    #[serde(rename = "minAchievements")]
    pub min_achievements: Option<i64>,
    pub network_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ChannelRankings {
    pub channel: String,
    #[serde(rename = "startDate", skip_serializing_if = "Option::is_none")]
    pub start_date: Option<String>,
    #[serde(rename = "endDate", skip_serializing_if = "Option::is_none")]
    pub end_date: Option<String>,
    #[serde(rename = "totalPlayers")]
    pub total_players: i64,
    #[serde(rename = "totalScore")]
    pub total_score: f64,
    pub entries: Vec<RankEntry>,
}

#[derive(Debug, Serialize)]
pub struct RankEntry {
    pub rank: i64,
    pub address: String,
    #[serde(rename = "displayName", skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    pub score: f64,
}

#[derive(Debug, Deserialize)]
pub struct UserQuery {
    pub channel: Option<Vec<String>>,
    #[serde(rename = "startDate")]
    pub start_date: Option<String>,
    #[serde(rename = "endDate")]
    pub end_date: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UserProfile {
    pub identity: Identity,
    pub achievements: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub channels: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct Identity {
    pub address: String,
    #[serde(rename = "delegatedFrom")]
    pub delegated_from: Vec<String>,
    #[serde(rename = "displayName", skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
}

// --- Achievements API types (PRC-1) ---

#[derive(Debug, Serialize)]
pub struct Prc1AchievementList {
    pub id: String,
    pub name: String,
    pub version: String,
    pub block: i64,
    pub caip2: String,
    pub time: String,
    pub achievements: Vec<Prc1Achievement>,
}

#[derive(Debug, Serialize)]
pub struct Prc1Achievement {
    pub name: String,
    #[serde(rename = "displayName")]
    pub display_name: String,
    pub description: String,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    pub score: i64,
    pub category: String,
    #[serde(rename = "percentCompleted", skip_serializing_if = "Option::is_none")]
    pub percent_completed: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct Prc1ListQuery {
    pub category: Option<String>,
    #[serde(rename = "isActive")]
    pub is_active: Option<bool>,
    pub network_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Prc1PlayerAchievements {
    pub block: i64,
    pub caip2: String,
    pub time: String,
    pub wallet: String,
    #[serde(rename = "userName", skip_serializing_if = "Option::is_none")]
    pub user_name: Option<String>,
    pub completed: i64,
    pub achievements: Vec<Prc1PlayerAchievement>,
}

#[derive(Debug, Serialize)]
pub struct Prc1PlayerAchievement {
    pub name: String,
    pub completed: bool,
    #[serde(rename = "completedDate", skip_serializing_if = "Option::is_none")]
    pub completed_date: Option<String>,
    #[serde(rename = "completedRate", skip_serializing_if = "Option::is_none")]
    pub completed_rate: Option<CompletedRate>,
}

#[derive(Debug, Serialize)]
pub struct CompletedRate {
    pub progress: f64,
    pub total: f64,
}
