//! Tauri command handlers for indexing operations.

use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use crate::AppState;
use crate::indexer::CancelFlag;
use serde::Serialize;

pub struct IndexingState {
    pub active_jobs: Mutex<HashMap<String, CancelFlag>>,
}

impl IndexingState {
    pub fn new() -> Self {
        Self { active_jobs: Mutex::new(HashMap::new()) }
    }
}

#[derive(Serialize)]
pub struct StartIndexingResult {
    pub job_id: String,
}

/// Start indexing a registered drive.
/// Uses the dedicated db_index connection — never blocks UI commands.
#[tauri::command]
pub async fn index_start(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    indexing_state: tauri::State<'_, IndexingState>,
    drive_id: String,
    incremental: bool,
) -> Result<StartIndexingResult, String> {
    {
        let jobs = indexing_state.active_jobs.lock().map_err(|e| e.to_string())?;
        if !jobs.is_empty() {
            return Err("An indexing job is already running. Please wait or cancel it first.".to_string());
        }
    }

    // Get drive root path using UI read connection
    let root_path = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT root_path FROM drives WHERE id = ?1",
            rusqlite::params![drive_id],
            |row| row.get::<_, String>(0),
        ).map_err(|_| "Drive not found".to_string())?
    };

    let cancel_flag: CancelFlag = Arc::new(Mutex::new(false));
    let cancel_flag_clone = Arc::clone(&cancel_flag);

    // Pass db_index to the indexer — dedicated connection, never shared
    let job_id = crate::indexer::start_indexing(
        app_handle,
        Arc::clone(&state.db_index),
        drive_id,
        root_path,
        incremental,
        cancel_flag_clone,
    );

    {
        let mut jobs = indexing_state.active_jobs.lock().map_err(|e| e.to_string())?;
        jobs.insert(job_id.clone(), cancel_flag);
    }

    Ok(StartIndexingResult { job_id })
}

/// Cancel an in-progress indexing job.
#[tauri::command]
pub async fn index_cancel(
    indexing_state: tauri::State<'_, IndexingState>,
    job_id: String,
) -> Result<bool, String> {
    let jobs = indexing_state.active_jobs.lock().map_err(|e| e.to_string())?;
    if let Some(flag) = jobs.get(&job_id) {
        let mut cancelled = flag.lock().map_err(|e| e.to_string())?;
        *cancelled = true;
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Clean up a completed or cancelled job.
#[tauri::command]
pub async fn index_cleanup(
    indexing_state: tauri::State<'_, IndexingState>,
    job_id: String,
) -> Result<(), String> {
    let mut jobs = indexing_state.active_jobs.lock().map_err(|e| e.to_string())?;
    jobs.remove(&job_id);
    Ok(())
}
