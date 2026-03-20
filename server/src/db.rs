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

            CREATE INDEX IF NOT EXISTS idx_scores_level ON scores(level, time_ms ASC);
            CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);
            CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);
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
        let result = conn.query_row(
            "SELECT player_id FROM auth_tokens WHERE token = ?1",
            params![token],
            |r| r.get::<_, i64>(0),
        );
        match result {
            Ok(pid) => Ok(Some(pid)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
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
}
