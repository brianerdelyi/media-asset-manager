//! Media Asset Manager — Tauri backend entry point.

pub mod assets;
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
    pub db_read: Arc<Mutex<Connection>>,
    pub db_index: Arc<Mutex<Connection>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = library::resolve_db_path()
        .expect("Failed to resolve library database path");

    let conn = db::connection::open(&db_path)
        .expect("Failed to open library database");

    library::resolve_thumbnails_path()
        .expect("Failed to create thumbnails directory");

    conn.execute("UPDATE drives SET is_online = 0", [])
        .expect("Failed to reset drive online status");

    let conn_read = db::connection::open_readonly(&db_path)
        .expect("Failed to open read-only database connection");

    let conn_index = db::connection::open_for_indexer(&db_path)
        .expect("Failed to open indexer database connection");

    let db = Arc::new(Mutex::new(conn));
    let db_read = Arc::new(Mutex::new(conn_read));
    let db_index = Arc::new(Mutex::new(conn_index));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            db: Arc::clone(&db),
            db_read: Arc::clone(&db_read),
            db_index: Arc::clone(&db_index),
        })
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
            commands::assets::asset_search,
            commands::assets::asset_get,
            commands::assets::asset_delete,
            commands::assets::asset_open,
            commands::assets::asset_reveal,
            commands::markers::marker_create,
            commands::markers::marker_update,
            commands::markers::marker_delete,
            commands::clip_export::clip_export,
            commands::settings::settings_get_stats,
            commands::settings::settings_get,
            commands::settings::settings_set,
            commands::settings::settings_delete_orphaned,
            commands::settings::settings_purge_thumbnails,
        ])
        .setup(move |app| {
            drives::watcher::start(app.handle().clone(), Arc::clone(&db));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Media Asset Manager");
}
