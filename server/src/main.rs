mod achievement_defs;
mod achievement_eval;
mod api;
mod db;
mod models;
mod rate_limit;
mod session;

use actix_files::Files;
use actix_web::{web, App, HttpServer};
use db::Db;
use rate_limit::RateLimiter;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3002);
    let db_path = std::env::var("DB_PATH").unwrap_or_else(|_| "heavy_ball.db".into());

    let db = Db::new(&db_path).expect("Failed to open database");

    // Prune expired auth tokens on startup
    if let Ok(n) = db.prune_expired_tokens() {
        if n > 0 {
            println!("Pruned {n} expired auth tokens");
        }
    }

    let db_data = web::Data::new(db);

    let jwt_secret = format!("{}{}", uuid::Uuid::new_v4(), uuid::Uuid::new_v4());
    let app_state = web::Data::new(session::AppState::new(jwt_secret));

    // Shared rate-limiter state across all workers: 60 requests per 60 seconds per IP
    let rl_state = rate_limit::new_state();

    println!("Heavy Ball server starting on http://localhost:{port}");

    HttpServer::new(move || {
        App::new()
            .wrap(RateLimiter::new(rl_state.clone(), 60, 60))
            .app_data(db_data.clone())
            .app_data(app_state.clone())
            .configure(api::config)
            .service(Files::new("/", "./static").index_file("index.html"))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
