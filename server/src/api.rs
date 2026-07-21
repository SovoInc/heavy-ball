use actix_web::{web, HttpRequest, HttpResponse};
use crate::db::Db;
use crate::models::*;
use crate::achievement_eval;
use crate::session::AppState;

const MIN_TIME_MS: i64 = 3_000;   // No level can be completed in under 3 seconds
const MAX_TIME_MS: i64 = 3_600_000; // 1 hour cap
const MIN_LEVEL: i64 = 1;
const MAX_LEVEL: i64 = 100;
const MAX_BOXES: i64 = 500;       // Generous upper bound per run
const MAX_POWER_UPS: i64 = 200;
const MAX_FALLS: i64 = 1_000;
const MAX_SPEED_BOOSTS: i64 = 500;
const BALL_IDS: [&str; 4] = ["core", "heavy", "light", "magma"];

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
            .route("/session/start", web::post().to(post_session_start))
            .route("/scores", web::post().to(post_score))
            .route("/scores/top", web::get().to(get_top_scores))
            .route("/stats/player/{id}", web::get().to(get_player_stats))
            .route("/achievements/{player_id}", web::get().to(get_achievements))
            .route("/leaderboard", web::get().to(get_leaderboard))
            .route("/progress/{player_id}", web::get().to(get_progress)),
    );
}

fn is_valid_wallet_address(addr: &str) -> bool {
    // Midnight shielded addresses: testnet "mn_shield-addr_" or mainnet Bech32m "mn_shield-addr1"
    // Minimum realistic length ~40, max ~200
    if addr.len() < 40 || addr.len() > 200 {
        return false;
    }
    let body = if let Some(b) = addr.strip_prefix("mn_shield-addr_") {
        b
    } else if let Some(b) = addr.strip_prefix("mn_shield-addr1") {
        b
    } else {
        return false;
    };
    body.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
}

fn validate_score(body: &ScorePayload) -> Option<&'static str> {
    if !BALL_IDS.contains(&body.ball_id.as_str()) || body.physics_version != 1 {
        return Some("invalid ball profile");
    }
    if body.level < MIN_LEVEL || body.level > MAX_LEVEL {
        return Some("level must be between 1 and 100");
    }
    if body.time_ms < MIN_TIME_MS || body.time_ms > MAX_TIME_MS {
        return Some("time_ms out of valid range");
    }
    if body.boxes_broken < 0 || body.boxes_broken > MAX_BOXES {
        return Some("boxes_broken out of valid range");
    }
    if body.power_ups_collected < 0 || body.power_ups_collected > MAX_POWER_UPS {
        return Some("power_ups_collected out of valid range");
    }
    if body.fall_count < 0 || body.fall_count > MAX_FALLS {
        return Some("fall_count out of valid range");
    }
    if body.speed_boosts < 0 || body.speed_boosts > MAX_SPEED_BOOSTS {
        return Some("speed_boosts out of valid range");
    }
    None
}

async fn post_session_start(
    req: HttpRequest,
    db: web::Data<Db>,
    app: web::Data<AppState>,
    body: web::Json<SessionStartRequest>,
) -> HttpResponse {
    match authenticate(&req, &db) {
        Some(pid) if pid == body.player_id => {},
        _ => return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "unauthorized" })),
    }

    if body.level < MIN_LEVEL || body.level > MAX_LEVEL {
        return HttpResponse::BadRequest().json(serde_json::json!({ "error": "level must be between 1 and 100" }));
    }
    if !BALL_IDS.contains(&body.ball_id.as_str()) || body.physics_version != 1 {
        return HttpResponse::BadRequest().json(serde_json::json!({ "error": "invalid ball profile" }));
    }

    // Level progression: level 1 always allowed, level N requires N-1 completed
    if body.level > 1 {
        match db.has_completed_level(body.player_id, body.level - 1) {
            Ok(true) => {},
            Ok(false) => return HttpResponse::Forbidden().json(
                serde_json::json!({ "error": format!("must complete level {} first", body.level - 1) })
            ),
            Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
        }
    }

    // Look up wallet address for signing key
    let wallet = match db.player_wallet(body.player_id) {
        Ok(Some(w)) => w,
        Ok(None) => return HttpResponse::BadRequest().json(serde_json::json!({ "error": "player has no wallet" })),
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // Create DB session row
    let session_id = match db.create_session(body.player_id, body.level, &body.ball_id, body.physics_version) {
        Ok(id) => id,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // Create JWT signed with server_secret + wallet_address
    match app.create_session_token(&session_id, body.player_id, body.level, &body.ball_id, body.physics_version, &wallet) {
        Ok(token) => HttpResponse::Ok().json(SessionStartResponse { session_token: token }),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

async fn post_wallet(db: web::Data<Db>, body: web::Json<WalletRequest>) -> HttpResponse {
    let wallet_address = body.wallet_address.trim();
    if wallet_address.is_empty() {
        return HttpResponse::BadRequest().body("wallet_address is required");
    }
    if !is_valid_wallet_address(wallet_address) {
        return HttpResponse::BadRequest().body("invalid wallet address format");
    }
    let network_id = if body.network_id.is_empty() { "mainnet" } else { &body.network_id };

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

async fn post_score(req: HttpRequest, db: web::Data<Db>, app: web::Data<AppState>, body: web::Json<ScoreSubmission>) -> HttpResponse {
    // 1. Decode the score JWT using the session token as the HMAC key
    let score = match app.decode_score_token(&body.score_token, &body.session_token) {
        Ok(s) => s,
        Err(msg) => return HttpResponse::BadRequest().json(serde_json::json!({ "error": msg })),
    };

    // 2. Authenticate: Bearer token must match the player_id inside the score
    match authenticate(&req, &db) {
        Some(pid) if pid == score.player_id => {},
        _ => return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "unauthorized" })),
    }

    // 3. Validate score bounds
    if let Some(msg) = validate_score(&score) {
        return HttpResponse::BadRequest().json(serde_json::json!({ "error": msg }));
    }

    // 4. Look up wallet for session JWT verification
    let wallet = match db.player_wallet(score.player_id) {
        Ok(Some(w)) => w,
        Ok(None) => return HttpResponse::BadRequest().json(serde_json::json!({ "error": "player has no wallet" })),
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // 5. Validate session JWT (signed with server_secret + wallet_address)
    let (session_id, session_pid, session_level, session_ball, session_version, elapsed_ms) =
        match app.validate_session_token(&body.session_token, &wallet) {
            Ok(v) => v,
            Err(msg) => return HttpResponse::BadRequest().json(serde_json::json!({ "error": msg })),
        };

    // 6. Cross-check: session claims must match score claims
    if session_pid != score.player_id || session_level != score.level || session_ball != score.ball_id || session_version != score.physics_version {
        return HttpResponse::BadRequest().json(serde_json::json!({ "error": "session/score mismatch" }));
    }

    // 7. Consume the DB session (one-time use)
    match db.consume_session(&session_id, score.player_id, score.level, &score.ball_id, score.physics_version) {
        Ok(true) => {},
        Ok(false) => return HttpResponse::BadRequest().json(serde_json::json!({ "error": "session already used or invalid" })),
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    }

    // 8. Wall-clock plausibility
    let min_wall_clock = (elapsed_ms - 60_000).max(0);
    if score.time_ms < min_wall_clock {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "submitted time is implausibly fast relative to session duration"
        }));
    }

    // 5. Insert/update score
    let score_id = match db.upsert_score(
        score.player_id, score.level, score.time_ms,
        score.boxes_broken, score.power_ups_collected,
        score.fall_count, score.speed_boosts,
        score.fire_maxed, score.ice_maxed,
        &score.ball_id, score.physics_version,
    ) {
        Ok(id) => id,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // 6. Evaluate achievements server-side
    let run_input = achievement_eval::RunInput {
        level: score.level,
        time_ms: score.time_ms,
        boxes_broken: score.boxes_broken,
        power_ups_collected: score.power_ups_collected,
        fall_count: score.fall_count,
        speed_boosts: score.speed_boosts,
        fire_maxed: score.fire_maxed,
        ice_maxed: score.ice_maxed,
    };
    let achievements = achievement_eval::evaluate_achievements(&db, score.player_id, &run_input);

    HttpResponse::Ok().json(ScoreResult {
        id: score_id,
        achievements_unlocked: achievements.iter().map(|(k, _)| k.clone()).collect(),
        achievements_display: achievements.iter().map(|(_, d)| d.clone()).collect(),
    })
}

async fn get_top_scores(db: web::Data<Db>, query: web::Query<LevelQuery>) -> HttpResponse {
    let level = query.level.unwrap_or(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let network_id = query.network_id.as_deref().unwrap_or("mainnet");
    let ball_id = query.ball_id.as_deref().unwrap_or("core");
    let physics_version = query.physics_version.unwrap_or(1);
    match db.top_scores(level, ball_id, physics_version, limit, network_id) {
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
    let network_id = query.network_id.as_deref().unwrap_or("mainnet");
    match db.global_leaderboard(limit, network_id) {
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
