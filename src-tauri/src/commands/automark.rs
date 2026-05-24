//! Tauri commands for keyword management and auto-marking.
use crate::AppState;
use crate::automark::{self, Keyword, AutoMarkResult};

/// Return all saved keywords.
#[tauri::command]
pub async fn keyword_list(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<Keyword>, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    automark::load_keywords(&conn)
}

/// Replace the full keyword list (add/edit/delete all done via full save).
#[tauri::command]
pub async fn keyword_save(
    state: tauri::State<'_, AppState>,
    keywords: Vec<Keyword>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    automark::save_keywords(&conn, &keywords)
}

/// Scan the transcript for the given asset and create auto-markers.
/// Returns the number of markers created and which keyword phrases matched.
#[tauri::command]
pub async fn automark_run(
    state: tauri::State<'_, AppState>,
    asset_id: String,
) -> Result<AutoMarkResult, String> {
    // Load keywords and run in one lock scope
    let keywords = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        automark::load_keywords(&conn)?
    };
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    automark::run_auto_marking(&conn, &asset_id, &keywords)
}
