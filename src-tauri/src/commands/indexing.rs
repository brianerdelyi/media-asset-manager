//! Tauri command handlers for indexing operations.

use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use crate::AppState;
use crate::indexer::CancelFlag;
use serde::Serialize;

/// Global map of active indexing jobs — keyed by job_id.
/// Stored as app state so commands can cancel running jobs.
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
#[tauri::command]
pub async fn index_start(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    indexing_state: tauri::State<'_, IndexingState>,
    drive_id: String,
    incremental: bool,
) -> Result<StartIndexingResult, String> {
    // Check if a job is already running
    {
        let jobs = indexing_state.active_jobs.lock().map_err(|e| e.to_string())?;
        if !jobs.is_empty() {
            return Err("INDEXING_IN_PROGRESS: An indexing job is already running. Please wait or cancel it first.".to_string());
        }
    }

    // Get drive root path
    let root_path = {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT root_path FROM drives WHERE id = ?1",
            rusqlite::params![drive_id],
            |row| row.get::<_, String>(0),
        ).map_err(|_| "DRIVE_NOT_FOUND: Drive not found".to_string())?
    };

    // Create cancellation flag
    let cancel_flag: CancelFlag = Arc::new(Mutex::new(false));
    let cancel_flag_clone = Arc::clone(&cancel_flag);

    // Start indexing job
    let job_id = crate::indexer::start_indexing(
        app_handle,
        Arc::clone(&state.db),
        drive_id,
        root_path,
        incremental,
        cancel_flag_clone,
    );

    // Register the job
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

/// Clean up a completed or cancelled job from the active jobs map.
#[tauri::command]
pub async fn index_cleanup(
    indexing_state: tauri::State<'_, IndexingState>,
    job_id: String,
) -> Result<(), String> {
    let mut jobs = indexing_state.active_jobs.lock().map_err(|e| e.to_string())?;
    jobs.remove(&job_id);
    Ok(())
}
