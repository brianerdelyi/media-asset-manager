//! Media Asset Manager — Tauri backend entry point.

pub mod db;
pub mod drives;
pub mod error;
pub mod library;

use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = library::resolve_db_path()
        .expect("Failed to resolve library database path");

    let conn = db::connection::open(&db_path)
        .expect("Failed to open library database");

    library::resolve_thumbnails_path()
        .expect("Failed to create thumbnails directory");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            db: Mutex::new(conn),
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running Media Asset Manager");
}
