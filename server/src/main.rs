mod achievement_defs;
mod api;
mod db;
mod models;

use actix_files::Files;
use actix_web::{web, App, HttpServer};
use db::Db;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3002);
    let db_path = std::env::var("DB_PATH").unwrap_or_else(|_| "heavy_ball.db".into());

    let db = Db::new(&db_path).expect("Failed to open database");
    let db_data = web::Data::new(db);

    println!("Heavy Ball server starting on http://localhost:{port}");

    HttpServer::new(move || {
        App::new()
            .app_data(db_data.clone())
            .configure(api::config)
            .service(Files::new("/", "./static").index_file("index.html"))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
