//! Media Asset Manager — Tauri backend entry point.

pub mod commands;
pub mod db;
pub mod drives;
pub mod error;
pub mod indexer;
pub mod library;
pub mod models;

use rusqlite::Connection;
use std::sync::{Arc, Mutex};

pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = library::resolve_db_path()
        .expect("Failed to resolve library database path");

    let conn = db::connection::open(&db_path)
        .expect("Failed to open library database");

    library::resolve_thumbnails_path()
        .expect("Failed to create thumbnails directory");

    // Reset all drives to offline on startup — watcher will set them online
    conn.execute("UPDATE drives SET is_online = 0", [])
        .expect("Failed to reset drive online status");

    let db = Arc::new(Mutex::new(conn));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState { db: Arc::clone(&db) })
        .manage(commands::indexing::IndexingState::new())
        .invoke_handler(tauri::generate_handler![
            commands::drives::drive_register,
            commands::drives::drive_list,
            commands::drives::drive_remove,
            commands::drives::drive_remove_confirm,
            commands::drives::drive_rename,
            commands::indexing::index_start,
            commands::indexing::index_cancel,
            commands::indexing::index_cleanup,
        ])
        .setup(move |app| {
            drives::watcher::start(app.handle().clone(), Arc::clone(&db));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Media Asset Manager");
}
