//! Drive connection/disconnection watcher.
//!
//! Uses two mechanisms working together:
//!
//! 1. Startup check — immediately checks all registered drive paths on launch
//!    to set correct initial online/offline state. This runs once.
//!
//! 2. FSEvents watcher — watches /Volumes for native OS mount/unmount events
//!    via the notify crate (which uses macOS FSEvents under the hood).
//!    Zero polling — the CPU sleeps until the OS delivers an event.
//!
//! This approach is battery-friendly and responds instantly to drive changes.

use notify::{RecommendedWatcher, RecursiveMode, Watcher, Config};
use std::sync::{Arc, Mutex};
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

/// Start the drive watcher.
/// Performs an initial status check then watches for OS mount/unmount events.
pub fn start(app_handle: AppHandle, db: Arc<Mutex<Connection>>) {
    std::thread::spawn(move || {
        // Step 1 — set correct initial state for all registered drives
        initial_status_check(&app_handle, &db);

        // Step 2 — watch for OS mount/unmount events (no polling)
        if let Err(e) = run_event_watcher(app_handle, db) {
            log::error!("Drive watcher error: {}", e);
        }
    });
}

/// Check all registered drive paths once on startup and emit events
/// for any that are online. This corrects the state after the DB reset.
fn initial_status_check(app_handle: &AppHandle, db: &Arc<Mutex<Connection>>) {
    let conn = match db.lock() {
        Ok(c) => c,
        Err(_) => return,
    };

    let mut stmt = match conn.prepare(
        "SELECT id, friendly_name, root_path,
         (SELECT COUNT(*) FROM locations WHERE drive_id = drives.id) as location_count
         FROM drives"
    ) {
        Ok(s) => s,
        Err(_) => return,
    };

    let drives: Vec<(String, String, String, i64)> = match stmt.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, i64>(3)?,
        ))
    }) {
        Ok(rows) => rows.filter_map(|r| r.ok()).collect(),
        Err(_) => return,
    };

    let window = match app_handle.get_webview_window("main") {
        Some(w) => w,
        None => return,
    };

    for (drive_id, friendly_name, root_path, location_count) in drives {
        if std::path::Path::new(&root_path).exists() {
            let _ = conn.execute(
                "UPDATE drives SET is_online = 1, last_seen_at = ?1 WHERE id = ?2",
                rusqlite::params![now_secs(), drive_id],
            );
            log::info!("Drive online at startup: {} ({})", friendly_name, root_path);
            let _ = window.emit("drive:connected", DriveConnectionEvent {
                drive_id,
                friendly_name,
                is_first_index: location_count == 0,
            });
        }
    }
}

/// Watch /Volumes for native OS filesystem events.
/// On macOS, notify uses FSEvents — no polling, no timer wakeups.
fn run_event_watcher(
    app_handle: AppHandle,
    db: Arc<Mutex<Connection>>,
) -> Result<(), Box<dyn std::error::Error>> {
    let (tx, rx) = std::sync::mpsc::channel();

    // Config::default() with no poll interval = native OS events (FSEvents on macOS)
    let mut watcher = RecommendedWatcher::new(tx, Config::default())?;

    #[cfg(target_os = "macos")]
    let watch_path = "/Volumes";

    #[cfg(not(target_os = "macos"))]
    let watch_path = "/";

    watcher.watch(std::path::Path::new(watch_path), RecursiveMode::NonRecursive)?;
    log::info!("Drive event watcher started on {} (FSEvents)", watch_path);

    loop {
        match rx.recv() {
            Ok(Ok(event)) => handle_fs_event(&event, &app_handle, &db),
            Ok(Err(e)) => log::warn!("Watcher event error: {}", e),
            Err(e) => {
                log::error!("Watcher channel closed: {}", e);
                break;
            }
        }
    }

    Ok(())
}

/// Handle a filesystem event from notify/FSEvents.
/// Create events indicate a drive mounted; Remove events indicate unmount.
fn handle_fs_event(
    event: &notify::Event,
    app_handle: &AppHandle,
    db: &Arc<Mutex<Connection>>,
) {
    use notify::EventKind;

    match &event.kind {
        EventKind::Create(_) => {
            for path in &event.paths {
                on_path_appeared(path, app_handle, db);
            }
        }
        EventKind::Remove(_) => {
            for path in &event.paths {
                on_path_removed(path, app_handle, db);
            }
        }
        _ => {}
    }
}

/// A path appeared under /Volumes — check if it matches a registered drive.
fn on_path_appeared(
    path: &std::path::Path,
    app_handle: &AppHandle,
    db: &Arc<Mutex<Connection>>,
) {
    let path_str = path.to_string_lossy().to_string();
    let conn = match db.lock() { Ok(c) => c, Err(_) => return };

    let result: Option<(String, String, i64)> = conn.query_row(
        "SELECT id, friendly_name,
         (SELECT COUNT(*) FROM locations WHERE drive_id = drives.id)
         FROM drives WHERE root_path = ?1 AND is_online = 0",
        rusqlite::params![path_str],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    ).ok();

    if let Some((drive_id, friendly_name, location_count)) = result {
        let _ = conn.execute(
            "UPDATE drives SET is_online = 1, last_seen_at = ?1 WHERE id = ?2",
            rusqlite::params![now_secs(), drive_id],
        );
        log::info!("Drive connected (FSEvent): {}", friendly_name);
        let _ = app_handle.get_webview_window("main").map(|w| {
            w.emit("drive:connected", DriveConnectionEvent {
                drive_id,
                friendly_name,
                is_first_index: location_count == 0,
            })
        });
    }
}

/// A path was removed from /Volumes — check if it matches a registered drive.
fn on_path_removed(
    path: &std::path::Path,
    app_handle: &AppHandle,
    db: &Arc<Mutex<Connection>>,
) {
    let path_str = path.to_string_lossy().to_string();
    let conn = match db.lock() { Ok(c) => c, Err(_) => return };

    let result: Option<(String, String)> = conn.query_row(
        "SELECT id, friendly_name FROM drives WHERE root_path = ?1 AND is_online = 1",
        rusqlite::params![path_str],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).ok();

    if let Some((drive_id, friendly_name)) = result {
        let _ = conn.execute(
            "UPDATE drives SET is_online = 0 WHERE id = ?1",
            rusqlite::params![drive_id],
        );
        log::info!("Drive disconnected (FSEvent): {}", friendly_name);
        let _ = app_handle.get_webview_window("main").map(|w| {
            w.emit("drive:disconnected", DriveDisconnectionEvent {
                drive_id,
                friendly_name,
            })
        });
    }
}

fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
