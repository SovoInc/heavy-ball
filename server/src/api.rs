use actix_web::{web, HttpRequest, HttpResponse};
use crate::db::Db;
use crate::models::*;
use crate::achievement_eval;

/// Extract and validate auth token from Authorization header.
/// Returns the authenticated player_id, or None if invalid/missing.
fn authenticate(req: &HttpRequest, db: &Db) -> Option<i64> {
    let header = req.headers().get("authorization")?.to_str().ok()?;
    let token = header.strip_prefix("Bearer ")?;
    db.validate_auth_token(token).ok()?
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/wallet", web::post().to(post_wallet))
            .route("/scores", web::post().to(post_score))
            .route("/scores/top", web::get().to(get_top_scores))
            .route("/stats/player/{id}", web::get().to(get_player_stats))
            .route("/achievements/{player_id}", web::get().to(get_achievements))
            .route("/leaderboard", web::get().to(get_leaderboard))
            .route("/progress/{player_id}", web::get().to(get_progress)),
    );
}

async fn post_wallet(db: web::Data<Db>, body: web::Json<WalletRequest>) -> HttpResponse {
    let wallet_address = body.wallet_address.trim();
    if wallet_address.is_empty() {
        return HttpResponse::BadRequest().body("wallet_address is required");
    }
    let network_id = if body.network_id.is_empty() { "preview" } else { &body.network_id };

    match db.upsert_wallet(wallet_address, network_id) {
        Ok((id, alias, wallet, net)) => {
            let auth_token = db.create_auth_token(id).unwrap_or_default();
            HttpResponse::Ok().json(PlayerResponse {
                id,
                alias,
                wallet_address: wallet,
                network_id: Some(net),
                auth_token: Some(auth_token),
            })
        },
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn post_score(req: HttpRequest, db: web::Data<Db>, body: web::Json<ScoreSubmission>) -> HttpResponse {
    match authenticate(&req, &db) {
        Some(pid) if pid == body.player_id => {},
        _ => return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "unauthorized" })),
    }

    // 1. Insert/update score
    let score_id = match db.upsert_score(
        body.player_id, body.level, body.time_ms,
        body.boxes_broken, body.power_ups_collected,
        body.fall_count, body.speed_boosts,
        body.fire_maxed, body.ice_maxed,
    ) {
        Ok(id) => id,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // 2. Evaluate achievements server-side
    let run_input = achievement_eval::RunInput {
        level: body.level,
        time_ms: body.time_ms,
        boxes_broken: body.boxes_broken,
        power_ups_collected: body.power_ups_collected,
        fall_count: body.fall_count,
        speed_boosts: body.speed_boosts,
        fire_maxed: body.fire_maxed,
        ice_maxed: body.ice_maxed,
    };
    let achievements = achievement_eval::evaluate_achievements(&db, body.player_id, &run_input);

    HttpResponse::Ok().json(ScoreResult {
        id: score_id,
        achievements_unlocked: achievements.iter().map(|(k, _)| k.clone()).collect(),
        achievements_display: achievements.iter().map(|(_, d)| d.clone()).collect(),
    })
}

async fn get_top_scores(db: web::Data<Db>, query: web::Query<LevelQuery>) -> HttpResponse {
    let level = query.level.unwrap_or(1);
    let limit = query.limit.unwrap_or(20).min(100);
    match db.top_scores(level, limit) {
        Ok(rows) => {
            let entries: Vec<ScoreEntry> = rows.into_iter().enumerate().map(|(i, (display_name, wallet_address, time_ms, pid))| {
                let alias = display_name.clone();
                ScoreEntry { rank: (i + 1) as i64, alias, display_name, wallet_address, time_ms, player_id: pid }
            }).collect();
            HttpResponse::Ok().json(entries)
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_player_stats(req: HttpRequest, db: web::Data<Db>, path: web::Path<i64>) -> HttpResponse {
    let player_id = path.into_inner();
    match authenticate(&req, &db) {
        Some(pid) if pid == player_id => {},
        _ => return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "unauthorized" })),
    }
    match db.player_stats(player_id) {
        Ok((total_runs, total_boxes_broken, total_power_ups, levels_completed)) => {
            HttpResponse::Ok().json(PlayerStats {
                total_runs, total_boxes_broken, total_power_ups, levels_completed,
            })
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_leaderboard(db: web::Data<Db>, query: web::Query<LeaderboardQuery>) -> HttpResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    match db.global_leaderboard(limit) {
        Ok(rows) => {
            let entries: Vec<LeaderboardEntry> = rows.into_iter().enumerate().map(|(i, (display_name, wallet_address, pid, max_level, total_time))| {
                let alias = display_name.clone();
                LeaderboardEntry {
                    rank: (i + 1) as i64, alias, display_name, wallet_address,
                    player_id: pid, max_level, total_time_ms: total_time,
                }
            }).collect();
            HttpResponse::Ok().json(entries)
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_progress(req: HttpRequest, db: web::Data<Db>, path: web::Path<i64>) -> HttpResponse {
    let player_id = path.into_inner();
    match authenticate(&req, &db) {
        Some(pid) if pid == player_id => {},
        _ => return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "unauthorized" })),
    }
    match db.player_progress(player_id) {
        Ok((max_level, total_time_ms)) => {
            HttpResponse::Ok().json(PlayerProgress { max_level, total_time_ms })
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

async fn get_achievements(req: HttpRequest, db: web::Data<Db>, path: web::Path<i64>) -> HttpResponse {
    let player_id = path.into_inner();
    match authenticate(&req, &db) {
        Some(pid) if pid == player_id => {},
        _ => return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "unauthorized" })),
    }
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
