//! Real-time drive connection/disconnection watcher.
//! Polls registered drive paths every 3 seconds and emits Tauri events
//! to the main window when online/offline status changes.

use std::sync::{Arc, Mutex};
use std::time::Duration;
use rusqlite::Connection;
use tauri::{AppHandle, Emitter, Manager};
use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
pub struct DriveConnectionEvent {
    pub drive_id: String,
    pub friendly_name: String,
    pub is_first_index: bool,
}

#[derive(Debug, Serialize, Clone)]
pub struct DriveDisconnectionEvent {
    pub drive_id: String,
    pub friendly_name: String,
}

pub fn start(app_handle: AppHandle, db: Arc<Mutex<Connection>>) {
    std::thread::spawn(move || {
        poll_drive_status(app_handle, db);
    });
}

fn poll_drive_status(app_handle: AppHandle, db: Arc<Mutex<Connection>>) {
    loop {
        std::thread::sleep(Duration::from_secs(3));

        let conn = match db.lock() {
            Ok(c) => c,
            Err(_) => continue,
        };

        let mut stmt = match conn.prepare(
            "SELECT id, friendly_name, root_path, is_online,
             (SELECT COUNT(*) FROM locations WHERE drive_id = drives.id) as location_count
             FROM drives"
        ) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let drives: Vec<(String, String, String, bool, i64)> = match stmt.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)? != 0,
                row.get::<_, i64>(4)?,
            ))
        }) {
            Ok(rows) => rows.filter_map(|r| r.ok()).collect(),
            Err(_) => continue,
        };

        let window = match app_handle.get_webview_window("main") {
            Some(w) => w,
            None => continue,
        };

        for (drive_id, friendly_name, root_path, was_online, location_count) in drives {
            let now_online = std::path::Path::new(&root_path).exists();

            if now_online == was_online {
                continue;
            }

            if now_online {
                let _ = conn.execute(
                    "UPDATE drives SET is_online = 1, last_seen_at = ?1 WHERE id = ?2",
                    rusqlite::params![now_secs(), drive_id],
                );
                let _ = window.emit("drive:connected", DriveConnectionEvent {
                    drive_id,
                    friendly_name,
                    is_first_index: location_count == 0,
                });
            } else {
                let _ = conn.execute(
                    "UPDATE drives SET is_online = 0 WHERE id = ?1",
                    rusqlite::params![drive_id],
                );
                let _ = window.emit("drive:disconnected", DriveDisconnectionEvent {
                    drive_id,
                    friendly_name,
                });
            }
        }
    }
}

fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
