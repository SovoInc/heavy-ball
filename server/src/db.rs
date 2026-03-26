use rusqlite::{Connection, Result, params};
use std::sync::Mutex;
use uuid::Uuid;

pub struct Db {
    pub conn: Mutex<Connection>,
}

impl Db {
    pub fn new(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        let db = Db { conn: Mutex::new(conn) };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alias TEXT UNIQUE NOT NULL,
                wallet_address TEXT UNIQUE,
                network_id TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER NOT NULL REFERENCES players(id),
                level INTEGER NOT NULL,
                time_ms INTEGER NOT NULL,
                boxes_broken INTEGER NOT NULL DEFAULT 0,
                power_ups_collected INTEGER NOT NULL DEFAULT 0,
                fall_count INTEGER NOT NULL DEFAULT 0,
                speed_boosts INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER NOT NULL REFERENCES players(id),
                achievement_key TEXT NOT NULL,
                unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
                UNIQUE(player_id, achievement_key)
            );

            CREATE TABLE IF NOT EXISTS auth_tokens (
                token TEXT PRIMARY KEY,
                player_id INTEGER NOT NULL REFERENCES players(id),
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                player_id INTEGER NOT NULL REFERENCES players(id),
                level INTEGER NOT NULL,
                used INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_scores_level ON scores(level, time_ms ASC);
            CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);
            CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_player ON sessions(player_id);
            ",
        )?;

        // Migration: add wallet_address, network_id columns to players
        let has_wallet: bool = conn.prepare("SELECT wallet_address FROM players LIMIT 0").is_ok();
        if !has_wallet {
            conn.execute_batch(
                "ALTER TABLE players ADD COLUMN wallet_address TEXT;
                 ALTER TABLE players ADD COLUMN network_id TEXT;
                 CREATE UNIQUE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet_address);",
            )?;
        }

        // Migration: add fall_count, speed_boosts columns
        let has_fall_count: bool = conn.prepare("SELECT fall_count FROM scores LIMIT 0").is_ok();
        if !has_fall_count {
            conn.execute_batch(
                "ALTER TABLE scores ADD COLUMN fall_count INTEGER NOT NULL DEFAULT 0;
                 ALTER TABLE scores ADD COLUMN speed_boosts INTEGER NOT NULL DEFAULT 0;",
            )?;
        }

        // Migration: add fire_maxed, ice_maxed columns
        let has_fire_maxed: bool = conn.prepare("SELECT fire_maxed FROM scores LIMIT 0").is_ok();
        if !has_fire_maxed {
            conn.execute_batch(
                "ALTER TABLE scores ADD COLUMN fire_maxed INTEGER NOT NULL DEFAULT 0;
                 ALTER TABLE scores ADD COLUMN ice_maxed INTEGER NOT NULL DEFAULT 0;",
            )?;
        }

        Ok(())
    }

    pub fn upsert_wallet(&self, wallet_address: &str, network_id: &str) -> Result<(i64, String, Option<String>, String)> {
        let conn = self.conn.lock().unwrap();
        let alias = format!("wallet:{wallet_address}");
        conn.execute(
            "INSERT OR IGNORE INTO players (alias, wallet_address, network_id) VALUES (?1, ?2, ?3)",
            params![alias, wallet_address, network_id],
        )?;
        conn.execute(
            "UPDATE players SET network_id = ?2 WHERE wallet_address = ?1",
            params![wallet_address, network_id],
        )?;
        let mut stmt = conn.prepare(
            "SELECT id, alias, wallet_address, COALESCE(network_id, 'preview') FROM players WHERE wallet_address = ?1",
        )?;
        let row = stmt.query_row(params![wallet_address], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
        })?;
        Ok(row)
    }

    pub fn create_auth_token(&self, player_id: i64) -> Result<String> {
        let conn = self.conn.lock().unwrap();
        let token = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO auth_tokens (token, player_id) VALUES (?1, ?2)",
            params![token, player_id],
        )?;
        Ok(token)
    }

    pub fn validate_auth_token(&self, token: &str) -> Result<Option<i64>> {
        let conn = self.conn.lock().unwrap();
        // Tokens expire after 30 days
        let result = conn.query_row(
            "SELECT player_id FROM auth_tokens WHERE token = ?1 AND created_at > datetime('now', '-30 days')",
            params![token],
            |r| r.get::<_, i64>(0),
        );
        match result {
            Ok(pid) => Ok(Some(pid)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// Remove auth tokens older than 30 days.
    pub fn prune_expired_tokens(&self) -> Result<usize> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "DELETE FROM auth_tokens WHERE created_at <= datetime('now', '-30 days')",
            [],
        )
    }

    pub fn upsert_score(
        &self, player_id: i64, level: i64, time_ms: i64,
        boxes_broken: i64, power_ups_collected: i64,
        fall_count: i64, speed_boosts: i64,
        fire_maxed: bool, ice_maxed: bool,
    ) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let fire_i = fire_maxed as i64;
        let ice_i = ice_maxed as i64;
        let existing: Option<(i64, i64)> = conn.prepare(
            "SELECT id, time_ms FROM scores WHERE player_id = ?1 AND level = ?2",
        )?.query_row(params![player_id, level], |row| {
            Ok((row.get(0)?, row.get(1)?))
        }).ok();

        match existing {
            Some((id, old_time)) if time_ms < old_time => {
                conn.execute(
                    "UPDATE scores SET time_ms=?1, boxes_broken=?2, power_ups_collected=?3, fall_count=?4, speed_boosts=?5, fire_maxed=?6, ice_maxed=?7 WHERE id=?8",
                    params![time_ms, boxes_broken, power_ups_collected, fall_count, speed_boosts, fire_i, ice_i, id],
                )?;
                Ok(id)
            }
            Some((id, _)) => {
                // Even if time isn't better, update elemental flags (OR with existing)
                conn.execute(
                    "UPDATE scores SET fire_maxed = MAX(fire_maxed, ?1), ice_maxed = MAX(ice_maxed, ?2) WHERE id = ?3",
                    params![fire_i, ice_i, id],
                )?;
                Ok(id)
            }
            None => {
                conn.execute(
                    "INSERT INTO scores (player_id, level, time_ms, boxes_broken, power_ups_collected, fall_count, speed_boosts, fire_maxed, ice_maxed) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
                    params![player_id, level, time_ms, boxes_broken, power_ups_collected, fall_count, speed_boosts, fire_i, ice_i],
                )?;
                Ok(conn.last_insert_rowid())
            }
        }
    }

    /// Sum a numeric column across all of a player's scores.
    pub fn player_aggregate(&self, player_id: i64, column: &str) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let sql = format!(
            "SELECT COALESCE(SUM({col}), 0) FROM scores WHERE player_id = ?1",
            col = column,
        );
        conn.query_row(&sql, params![player_id], |r| r.get(0))
    }

    /// Count distinct levels completed by a player.
    pub fn player_levels_completed(&self, player_id: i64) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT COUNT(DISTINCT level) FROM scores WHERE player_id = ?1",
            params![player_id],
            |r| r.get(0),
        )
    }

    pub fn top_scores(&self, level: i64, limit: i64) -> Result<Vec<(String, Option<String>, i64, i64)>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT COALESCE(p.wallet_address, p.alias), p.wallet_address, MIN(s.time_ms) as best_time, s.player_id
             FROM scores s JOIN players p ON s.player_id = p.id
             WHERE s.level = ?1
             GROUP BY s.player_id
             ORDER BY best_time ASC
             LIMIT ?2",
        )?;
        let rows = stmt.query_map(params![level, limit], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
        })?.collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }

    pub fn player_stats(&self, player_id: i64) -> Result<(i64, i64, i64, i64)> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT
                COUNT(*) as total_runs,
                COALESCE(SUM(boxes_broken), 0) as total_boxes_broken,
                COALESCE(SUM(power_ups_collected), 0) as total_power_ups,
                COUNT(DISTINCT level) as levels_completed
             FROM scores WHERE player_id = ?1"
        )?;
        let row = stmt.query_row(params![player_id], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
        })?;
        Ok(row)
    }

    pub fn unlock_achievement(&self, player_id: i64, key: &str) -> Result<String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO achievements (player_id, achievement_key) VALUES (?1, ?2)",
            params![player_id, key],
        )?;
        Ok("ok".to_string())
    }

    pub fn global_leaderboard(&self, limit: i64) -> Result<Vec<(String, Option<String>, i64, i64, i64)>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT COALESCE(p.wallet_address, p.alias), p.wallet_address, p.id, sub.max_level, sub.total_time
             FROM (
               SELECT player_id, MAX(level) as max_level,
                      SUM(best_time) as total_time
               FROM (
                 SELECT player_id, level, MIN(time_ms) as best_time
                 FROM scores
                 GROUP BY player_id, level
               )
               GROUP BY player_id
             ) sub
             JOIN players p ON sub.player_id = p.id
             ORDER BY sub.max_level DESC, sub.total_time ASC
             LIMIT ?1"
        )?;
        let rows = stmt.query_map(params![limit], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?))
        })?.collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }

    pub fn player_progress(&self, player_id: i64) -> Result<(i64, i64)> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT COALESCE(MAX(level), 0) as max_level,
                    COALESCE(SUM(best_time), 0) as total_time
             FROM (
               SELECT level, MIN(time_ms) as best_time
               FROM scores
               WHERE player_id = ?1
               GROUP BY level
             )"
        )?;
        let row = stmt.query_row(params![player_id], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?;
        Ok(row)
    }

    /// Get the wallet_address for a player. Returns None if no wallet is set.
    pub fn player_wallet(&self, player_id: i64) -> Result<Option<String>> {
        let conn = self.conn.lock().unwrap();
        let result = conn.query_row(
            "SELECT wallet_address FROM players WHERE id = ?1",
            params![player_id],
            |r| r.get::<_, Option<String>>(0),
        );
        match result {
            Ok(w) => Ok(w),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// Create a new session row and return the session ID.
    pub fn create_session(&self, player_id: i64, level: i64) -> Result<String> {
        let conn = self.conn.lock().unwrap();
        let id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO sessions (id, player_id, level) VALUES (?1, ?2, ?3)",
            params![id, player_id, level],
        )?;
        Ok(id)
    }

    /// Mark a session as used. Returns true if it was valid and unused, false otherwise.
    pub fn consume_session(&self, session_id: &str, player_id: i64, level: i64) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        let updated = conn.execute(
            "UPDATE sessions SET used = 1 WHERE id = ?1 AND player_id = ?2 AND level = ?3 AND used = 0",
            params![session_id, player_id, level],
        )?;
        Ok(updated > 0)
    }

    /// Returns true if the player has a score recorded for the given level.
    pub fn has_completed_level(&self, player_id: i64, level: i64) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM scores WHERE player_id = ?1 AND level = ?2",
            params![player_id, level],
            |r| r.get(0),
        )?;
        Ok(count > 0)
    }

    pub fn player_achievements(&self, player_id: i64) -> Result<Vec<(String, String)>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT achievement_key, unlocked_at FROM achievements WHERE player_id = ?1",
        )?;
        let rows = stmt.query_map(params![player_id], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?.collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }

    // --- Metrics / Achievements API methods ---

    pub fn total_players(&self, network_id: &str) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM players WHERE network_id = ?1",
            params![network_id], |r| r.get(0),
        )?;
        Ok(count)
    }

    pub fn achievement_unlock_count(&self, key: &str, network_id: &str) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn.query_row(
            "SELECT COUNT(DISTINCT a.player_id) FROM achievements a JOIN players p ON a.player_id = p.id WHERE a.achievement_key = ?1 AND p.network_id = ?2",
            params![key, network_id], |r| r.get(0),
        )?;
        Ok(count)
    }

    /// Leaderboard channel: most distinct levels completed per player.
    pub fn channel_leaderboard(
        &self, start: &str, end: &str, limit: i64, offset: i64, network_id: &str, min_achievements: Option<i64>,
    ) -> Result<(i64, f64, Vec<(String, Option<String>, f64)>)> {
        let conn = self.conn.lock().unwrap();
        let min_ach = min_achievements.unwrap_or(0);
        let ach_having_4 = "HAVING (SELECT COUNT(*) FROM achievements WHERE player_id = s.player_id) >= ?4";
        let ach_having_6 = "HAVING (SELECT COUNT(*) FROM achievements WHERE player_id = s.player_id) >= ?6";
        let total_players: i64 = conn.query_row(
            &format!("SELECT COUNT(*) FROM (SELECT s.player_id FROM scores s JOIN players p ON s.player_id = p.id WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?3 GROUP BY s.player_id {})", ach_having_4),
            params![start, end, network_id, min_ach], |r| r.get(0),
        )?;
        let total_score: f64 = conn.query_row(
            &format!("SELECT COALESCE(SUM(levels), 0) FROM (SELECT COUNT(DISTINCT s.level) as levels FROM scores s JOIN players p ON s.player_id = p.id WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?3 GROUP BY s.player_id {})", ach_having_4),
            params![start, end, network_id, min_ach], |r| r.get(0),
        )?;
        let mut stmt = conn.prepare(
            &format!("SELECT COALESCE(p.wallet_address, 'alias:' || p.alias), COALESCE(p.wallet_address, p.alias), COUNT(DISTINCT s.level) as levels
             FROM scores s JOIN players p ON s.player_id = p.id
             WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?5
             GROUP BY s.player_id {} ORDER BY levels DESC LIMIT ?3 OFFSET ?4", ach_having_6),
        )?;
        let rows = stmt.query_map(params![start, end, limit, offset, network_id, min_ach], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, Option<String>>(1)?, row.get::<_, f64>(2)?))
        })?.collect::<Result<Vec<_>>>()?;
        Ok((total_players, total_score, rows))
    }

    /// Cumulative channel: SUM of a column across all scores.
    pub fn channel_cumulative(
        &self, column: &str, start: &str, end: &str, limit: i64, offset: i64, network_id: &str, min_achievements: Option<i64>,
    ) -> Result<(i64, f64, Vec<(String, Option<String>, f64)>)> {
        let conn = self.conn.lock().unwrap();
        let col = match column {
            "boxes_broken" | "power_ups_collected" | "speed_boosts" | "fall_count" => column,
            _ => return Ok((0, 0.0, vec![])),
        };
        let min_ach = min_achievements.unwrap_or(0);
        let ach_having_4 = "HAVING (SELECT COUNT(*) FROM achievements WHERE player_id = s.player_id) >= ?4";
        let ach_having_6 = "HAVING (SELECT COUNT(*) FROM achievements WHERE player_id = s.player_id) >= ?6";
        let total_players: i64 = conn.query_row(
            &format!("SELECT COUNT(*) FROM (SELECT s.player_id FROM scores s JOIN players p ON s.player_id = p.id WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?3 GROUP BY s.player_id {})", ach_having_4),
            params![start, end, network_id, min_ach], |r| r.get(0),
        )?;
        let q_total = format!(
            "SELECT COALESCE(SUM(total), 0) FROM (SELECT SUM(s.{}) as total FROM scores s JOIN players p ON s.player_id = p.id WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?3 GROUP BY s.player_id {})", col, ach_having_4
        );
        let total_score: f64 = conn.query_row(&q_total, params![start, end, network_id, min_ach], |r| r.get(0))?;

        let q = format!(
            "SELECT COALESCE(p.wallet_address, 'alias:' || p.alias), COALESCE(p.wallet_address, p.alias), SUM(s.{}) as total
             FROM scores s JOIN players p ON s.player_id = p.id
             WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?5
             GROUP BY s.player_id {} ORDER BY total DESC LIMIT ?3 OFFSET ?4", col, ach_having_6
        );
        let mut stmt = conn.prepare(&q)?;
        let rows = stmt.query_map(params![start, end, limit, offset, network_id, min_ach], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, Option<String>>(1)?, row.get::<_, f64>(2)?))
        })?.collect::<Result<Vec<_>>>()?;
        Ok((total_players, total_score, rows))
    }

    /// Interactions channel: total levels completed per player.
    pub fn channel_interactions(
        &self, start: &str, end: &str, limit: i64, offset: i64, network_id: &str, min_achievements: Option<i64>,
    ) -> Result<(i64, f64, Vec<(String, Option<String>, f64)>)> {
        let conn = self.conn.lock().unwrap();
        let min_ach = min_achievements.unwrap_or(0);
        let ach_having_4 = "HAVING (SELECT COUNT(*) FROM achievements WHERE player_id = s.player_id) >= ?4";
        let ach_having_6 = "HAVING (SELECT COUNT(*) FROM achievements WHERE player_id = s.player_id) >= ?6";
        let total_players: i64 = conn.query_row(
            &format!("SELECT COUNT(*) FROM (SELECT s.player_id FROM scores s JOIN players p ON s.player_id = p.id WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?3 GROUP BY s.player_id {})", ach_having_4),
            params![start, end, network_id, min_ach], |r| r.get(0),
        )?;
        let total_score: f64 = conn.query_row(
            &format!("SELECT COALESCE(SUM(cnt), 0) FROM (SELECT CAST(COUNT(*) AS REAL) as cnt FROM scores s JOIN players p ON s.player_id = p.id WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?3 GROUP BY s.player_id {})", ach_having_4),
            params![start, end, network_id, min_ach], |r| r.get(0),
        )?;
        let mut stmt = conn.prepare(
            &format!("SELECT COALESCE(p.wallet_address, 'alias:' || p.alias), COALESCE(p.wallet_address, p.alias), CAST(COUNT(*) AS REAL) as completions
             FROM scores s JOIN players p ON s.player_id = p.id
             WHERE s.created_at >= ?1 AND s.created_at <= ?2 AND p.network_id = ?5
             GROUP BY s.player_id {} ORDER BY completions DESC LIMIT ?3 OFFSET ?4", ach_having_6),
        )?;
        let rows = stmt.query_map(params![start, end, limit, offset, network_id, min_ach], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, Option<String>>(1)?, row.get::<_, f64>(2)?))
        })?.collect::<Result<Vec<_>>>()?;
        Ok((total_players, total_score, rows))
    }

    /// Resolve a player by wallet address or alias.
    pub fn resolve_player_by_address(&self, address: &str) -> Result<Option<(i64, String, Option<String>)>> {
        let conn = self.conn.lock().unwrap();

        // Try wallet_address first
        let maybe = conn.query_row(
            "SELECT id, alias, wallet_address FROM players WHERE wallet_address = ?1",
            params![address],
            |row| Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?, row.get::<_, Option<String>>(2)?)),
        );
        if let Ok(row) = maybe {
            return Ok(Some(row));
        }

        // Try alias-based address
        if let Some(alias) = address.strip_prefix("alias:") {
            let maybe_alias = conn.query_row(
                "SELECT id, alias, wallet_address FROM players WHERE alias = ?1",
                params![alias],
                |row| Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?, row.get::<_, Option<String>>(2)?)),
            );
            if let Ok(row) = maybe_alias {
                return Ok(Some(row));
            }
        }

        Ok(None)
    }

    /// Get a float aggregate for a player's scores (for achievement progress).
    pub fn player_aggregate_f64(&self, player_id: i64, column: &str) -> Result<f64> {
        let conn = self.conn.lock().unwrap();
        match column {
            "boxes_broken" | "power_ups_collected" | "speed_boosts" | "fall_count" => {
                let q = format!("SELECT COALESCE(SUM({}), 0) FROM scores WHERE player_id = ?1", column);
                conn.query_row(&q, params![player_id], |r| r.get(0))
            }
            "levels_completed" => {
                conn.query_row(
                    "SELECT CAST(COUNT(DISTINCT level) AS REAL) FROM scores WHERE player_id = ?1",
                    params![player_id], |r| r.get(0),
                )
            }
            "best_time" => {
                conn.query_row(
                    "SELECT COALESCE(MIN(time_ms), 0) FROM scores WHERE player_id = ?1",
                    params![player_id], |r| r.get(0),
                )
            }
            "level_completions" => {
                conn.query_row(
                    "SELECT CAST(COUNT(*) AS REAL) FROM scores WHERE player_id = ?1",
                    params![player_id], |r| r.get(0),
                )
            }
            _ => Ok(0.0),
        }
    }

    pub fn player_rank_in_channel(&self, player_id: i64, channel: &str) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        match channel {
            "leaderboard" => {
                let levels: f64 = conn.query_row(
                    "SELECT CAST(COUNT(DISTINCT level) AS REAL) FROM scores WHERE player_id = ?1",
                    params![player_id], |r| r.get(0),
                )?;
                let rank: i64 = conn.query_row(
                    "SELECT COUNT(*) + 1 FROM (SELECT COUNT(DISTINCT level) as lvls FROM scores GROUP BY player_id HAVING lvls > ?1)",
                    params![levels], |r| r.get(0),
                )?;
                Ok(rank)
            }
            _ => Ok(0),
        }
    }
}
