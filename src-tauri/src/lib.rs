//! Media Asset Manager — Tauri backend entry point.

pub mod commands;
pub mod db;
pub mod drives;
pub mod error;
pub mod library;
pub mod models;

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
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState { db: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![
            commands::drives::drive_register,
            commands::drives::drive_list,
            commands::drives::drive_remove,
            commands::drives::drive_remove_confirm,
            commands::drives::drive_rename,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Media Asset Manager");
}
