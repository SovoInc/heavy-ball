use crate::achievement_defs::*;
use crate::db::Db;

pub struct RunInput {
    pub level: i64,
    pub time_ms: i64,
    pub boxes_broken: i64,
    pub power_ups_collected: i64,
    pub fall_count: i64,
    pub speed_boosts: i64,
    pub fire_maxed: bool,
    pub ice_maxed: bool,
}

/// Evaluates which achievements are newly unlocked by this run.
/// Must be called *after* the score row is inserted so cumulative queries include this run.
pub fn evaluate_achievements(
    db: &Db,
    player_id: i64,
    run: &RunInput,
) -> Vec<(String, String)> {
    let already_unlocked = db.player_achievements(player_id).unwrap_or_default();
    let unlocked_keys: std::collections::HashSet<String> =
        already_unlocked.into_iter().map(|(k, _)| k).collect();

    let defs: &[(&str, &str)] = &[
        (FIRST_FINISH, "First Finish"),
        (SPEED_DEMON, "Speed Demon"),
        (BOX_SMASHER, "Box Smasher"),
        (POWER_COLLECTOR, "Power Collector"),
        (COMPLETIONIST, "Completionist"),
        (NO_FALL, "No Fall"),
        (SPEEDSTER, "Speedster"),
        (FIRE_MAXED, "Overheated"),
        (ICE_MAXED, "Frozen Solid"),
    ];

    let mut newly_unlocked: Vec<(String, String)> = Vec::new();

    for &(key, display) in defs {
        if unlocked_keys.contains(key) {
            continue;
        }

        let earned = match key {
            // Complete any level
            k if k == FIRST_FINISH => true,

            // Complete a level under 30 seconds
            k if k == SPEED_DEMON => run.time_ms < 30_000,

            // Break 50+ total boxes (cumulative across all runs)
            k if k == BOX_SMASHER => {
                db.player_aggregate(player_id, "boxes_broken").unwrap_or(0) >= 50
            }

            // Collect 25+ total power-ups (cumulative)
            k if k == POWER_COLLECTOR => {
                db.player_aggregate(player_id, "power_ups_collected").unwrap_or(0) >= 25
            }

            // Complete all 100 levels
            k if k == COMPLETIONIST => {
                db.player_levels_completed(player_id).unwrap_or(0) >= 100
            }

            // Complete a level without falling
            k if k == NO_FALL => run.fall_count == 0,

            // Use 10+ speed boosts (cumulative)
            k if k == SPEEDSTER => {
                db.player_aggregate(player_id, "speed_boosts").unwrap_or(0) >= 10
            }

            // Reach max fire buildup
            k if k == FIRE_MAXED => run.fire_maxed,

            // Reach max ice buildup (get frozen)
            k if k == ICE_MAXED => run.ice_maxed,

            _ => false,
        };

        if earned {
            let _ = db.unlock_achievement(player_id, key);
            newly_unlocked.push((key.to_string(), display.to_string()));
        }
    }

    newly_unlocked
}
