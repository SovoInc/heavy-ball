use actix_web::{web, HttpResponse};
use crate::db::Db;
use crate::models::*;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/alias", web::post().to(post_alias))
            .route("/scores", web::post().to(post_score))
            .route("/scores/top", web::get().to(get_top_scores))
            .route("/stats/player/{id}", web::get().to(get_player_stats))
            .route("/achievements", web::post().to(post_achievement))
            .route("/achievements/{player_id}", web::get().to(get_achievements))
            .route("/leaderboard", web::get().to(get_leaderboard))
            .route("/progress/{player_id}", web::get().to(get_progress)),
    );
}

async fn post_alias(db: web::Data<Db>, body: web::Json<AliasRequest>) -> HttpResponse {
    match db.upsert_alias(&body.alias) {
        Ok((id, alias)) => HttpResponse::Ok().json(PlayerResponse { id, alias }),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn post_score(db: web::Data<Db>, body: web::Json<ScoreSubmission>) -> HttpResponse {
    match db.insert_score(
        body.player_id, body.level, body.time_ms,
        body.boxes_broken, body.power_ups_collected,
    ) {
        Ok(id) => HttpResponse::Ok().json(serde_json::json!({ "id": id })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_top_scores(db: web::Data<Db>, query: web::Query<LevelQuery>) -> HttpResponse {
    let level = query.level.unwrap_or(1);
    let limit = query.limit.unwrap_or(20).min(100);
    match db.top_scores(level, limit) {
        Ok(rows) => {
            let entries: Vec<ScoreEntry> = rows.into_iter().enumerate().map(|(i, (alias, time_ms, pid))| {
                ScoreEntry { rank: (i + 1) as i64, alias, time_ms, player_id: pid }
            }).collect();
            HttpResponse::Ok().json(entries)
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_player_stats(db: web::Data<Db>, path: web::Path<i64>) -> HttpResponse {
    let player_id = path.into_inner();
    match db.player_stats(player_id) {
        Ok((total_runs, total_boxes_broken, total_power_ups, levels_completed)) => {
            HttpResponse::Ok().json(PlayerStats {
                total_runs, total_boxes_broken, total_power_ups, levels_completed,
            })
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn post_achievement(db: web::Data<Db>, body: web::Json<AchievementUnlock>) -> HttpResponse {
    match db.unlock_achievement(body.player_id, &body.achievement_key) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({ "status": "ok" })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_leaderboard(db: web::Data<Db>, query: web::Query<LeaderboardQuery>) -> HttpResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    match db.global_leaderboard(limit) {
        Ok(rows) => {
            let entries: Vec<LeaderboardEntry> = rows.into_iter().enumerate().map(|(i, (alias, pid, max_level, total_time))| {
                LeaderboardEntry { rank: (i + 1) as i64, alias, player_id: pid, max_level, total_time_ms: total_time }
            }).collect();
            HttpResponse::Ok().json(entries)
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_progress(db: web::Data<Db>, path: web::Path<i64>) -> HttpResponse {
    let player_id = path.into_inner();
    match db.player_progress(player_id) {
        Ok((max_level, total_time_ms)) => {
            HttpResponse::Ok().json(PlayerProgress { max_level, total_time_ms })
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_achievements(db: web::Data<Db>, path: web::Path<i64>) -> HttpResponse {
    let player_id = path.into_inner();
    match db.player_achievements(player_id) {
        Ok(rows) => {
            let entries: Vec<AchievementRecord> = rows.into_iter().map(|(key, at)| {
                AchievementRecord { achievement_key: key, unlocked_at: at }
            }).collect();
            HttpResponse::Ok().json(entries)
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
