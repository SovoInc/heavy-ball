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

    let mut newly_unlocked: Vec<(String, String)> = Vec::new();

    for def in ACHIEVEMENTS {
        if unlocked_keys.contains(def.name) {
            continue;
        }

        let earned = match def.name {
            FIRST_FINISH => true,

            GETTING_STARTED => {
                db.player_levels_completed(player_id).unwrap_or(0) >= 10
            }

            SPEED_DEMON => run.time_ms < 10_000,

            BOX_SMASHER => {
                db.player_aggregate(player_id, "boxes_broken").unwrap_or(0) >= 50
            }

            DEMOLITION_EXPERT => {
                db.player_aggregate(player_id, "boxes_broken").unwrap_or(0) >= 200
            }

            POWER_COLLECTOR => {
                db.player_aggregate(player_id, "power_ups_collected").unwrap_or(0) >= 25
            }

            HALFWAY_THERE => {
                db.player_levels_completed(player_id).unwrap_or(0) >= 50
            }

            COMPLETIONIST => {
                db.player_levels_completed(player_id).unwrap_or(0) >= 100
            }

            NO_FALL => run.fall_count == 0,

            PERSISTENT => {
                db.player_aggregate(player_id, "fall_count").unwrap_or(0) >= 100
            }

            FIRE_MAXED => run.fire_maxed,

            ICE_MAXED => run.ice_maxed,

            TEMPERED => run.fire_maxed && run.ice_maxed,

            _ => false,
        };

        if earned {
            let _ = db.unlock_achievement(player_id, def.name);
            newly_unlocked.push((def.name.to_string(), def.display_name.to_string()));
        }
    }

    newly_unlocked
}
