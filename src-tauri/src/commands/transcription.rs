//! Tauri command handlers for transcription and model management.
use crate::AppState;
use crate::transcription::{engine, models, job};
use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::process::{Command, Stdio};
use tauri::Emitter;
use uuid::Uuid;

// ── Environment ──────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn transcription_check_environment() -> Result<engine::WhisperStatus, String> {
    Ok(engine::find_whisper_cli())
}

// ── Model management ─────────────────────────────────────────────────────────

#[tauri::command]
pub async fn model_list() -> Result<Vec<models::ModelInfo>, String> {
    let models_dir = engine::resolve_models_path()?;
    Ok(models::list_models(&models_dir))
}

#[tauri::command]
pub async fn model_delete(model_name: String) -> Result<(), String> {
    let models_dir = engine::resolve_models_path()?;
    let model_def = models::MODELS.iter()
        .find(|m| m.name == model_name)
        .ok_or_else(|| format!("Unknown model: {}", model_name))?;
    let path = models_dir.join(model_def.filename);
    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn model_download(app: tauri::AppHandle, model_name: String) -> Result<(), String> {
    let models_dir = engine::resolve_models_path()?;
    let model_def = models::MODELS.iter()
        .find(|m| m.name == model_name)
        .ok_or_else(|| format!("Unknown model: {}", model_name))?;
    let dest_path = models_dir.join(model_def.filename);
    let tmp_path = models_dir.join(format!("{}.tmp", model_def.filename));
    let url = model_def.url.to_string();
    let total_bytes = model_def.size_bytes;
    let name = model_name.clone();
    tokio::spawn(async move {
        if let Err(e) = download_model_file(&app, &name, &url, &tmp_path, &dest_path, total_bytes).await {
            let _ = app.emit("model:download:error", serde_json::json!({ "model_name": name, "error": e }));
            let _ = std::fs::remove_file(&tmp_path);
        }
    });
    Ok(())
}

async fn download_model_file(
    app: &tauri::AppHandle, model_name: &str, url: &str,
    tmp_path: &std::path::Path, dest_path: &std::path::Path, total_bytes: u64,
) -> Result<(), String> {
    use std::io::Write;
    let response = reqwest::get(url).await.map_err(|e| format!("Download failed: {}", e))?;
    if !response.status().is_success() {
        return Err(format!("HTTP {}: download failed", response.status()));
    }
    let mut file = std::fs::File::create(tmp_path).map_err(|e| format!("Cannot create file: {}", e))?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Download error: {}", e))?;
        file.write_all(&chunk).map_err(|e| format!("Write error: {}", e))?;
        downloaded += chunk.len() as u64;
        let percent = if total_bytes > 0 { ((downloaded as f64 / total_bytes as f64) * 100.0) as u8 } else { 0 };
        let _ = app.emit("model:download:progress", serde_json::json!({
            "model_name": model_name, "percent": percent,
            "bytes_downloaded": downloaded, "total_bytes": total_bytes,
        }));
    }
    std::fs::rename(tmp_path, dest_path).map_err(|e| format!("Failed to finalise download: {}", e))?;
    let _ = app.emit("model:download:complete", serde_json::json!({ "model_name": model_name }));
    Ok(())
}

// ── Transcription ─────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct StartTranscriptionResult { pub job_id: String }

#[derive(Serialize)]
pub struct EstimateResult { pub estimated_seconds: u64 }

#[tauri::command]
pub async fn transcription_estimate(
    state: tauri::State<'_, AppState>, asset_id: String, model_name: String,
) -> Result<EstimateResult, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    let duration_ms: Option<i64> = conn.query_row(
        "SELECT duration_ms FROM assets WHERE id = ?1",
        rusqlite::params![asset_id], |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    let duration_secs = duration_ms.unwrap_or(0) as f64 / 1000.0;
    let rtf = models::get_rtf(&model_name);
    let estimated = (duration_secs * rtf as f64).ceil() as u64;
    Ok(EstimateResult { estimated_seconds: estimated })
}

#[tauri::command]
pub async fn transcription_start(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    transcription_state: tauri::State<'_, job::TranscriptionState>,
    asset_id: String, model_name: String, language: String, prompt: String,
) -> Result<StartTranscriptionResult, String> {
    let models_dir = engine::resolve_models_path()?;
    let model_def = models::MODELS.iter()
        .find(|m| m.name == model_name)
        .ok_or_else(|| format!("Unknown model: {}", model_name))?;
    let model_path = models_dir.join(model_def.filename);
    if !model_path.exists() {
        return Err(format!("Model '{}' is not installed. Download it in Settings.", model_name));
    }
    let whisper = engine::find_whisper_cli();
    let whisper_path = whisper.path.ok_or("whisper-cli not found. Install with: brew install whisper-cpp")?;
    let asset_path = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        let path: Option<String> = conn.query_row(
            "SELECT l.file_path FROM locations l JOIN drives d ON d.id = l.drive_id
             WHERE l.asset_id = ?1 AND d.is_online = 1 AND l.is_missing = 0 LIMIT 1",
            rusqlite::params![asset_id], |row| row.get(0),
        ).ok();
        path.ok_or("Asset has no online location")?
    };
    let duration_ms: Option<i64> = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        conn.query_row("SELECT duration_ms FROM assets WHERE id = ?1",
            rusqlite::params![asset_id], |row| row.get(0)).ok().flatten()
    };
    let job_id = Uuid::new_v4().to_string();
    let child_holder: Arc<Mutex<Option<std::process::Child>>> = Arc::new(Mutex::new(None));
    {
        let mut jobs = transcription_state.active_jobs.lock().map_err(|e| e.to_string())?;
        jobs.insert(job_id.clone(), Arc::clone(&child_holder));
    }
    let job_id_bg = job_id.clone();
    let asset_id_bg = asset_id.clone();
    let model_name_bg = model_name.clone();
    let db = Arc::clone(&state.db);
    let jobs_ref = {
        let jobs = transcription_state.active_jobs.lock().map_err(|e| e.to_string())?;
        jobs.get(&job_id).cloned().unwrap()
    };
    tokio::spawn(async move {
        let result = run_transcription(
            &app, &job_id_bg, &asset_id_bg, &asset_path, &model_name_bg,
            &model_path.to_string_lossy(), &whisper_path, &language, &prompt,
            duration_ms, &db, &jobs_ref,
        ).await;
        match result {
            Ok(_) => { let _ = app.emit("transcription:complete", serde_json::json!({ "job_id": job_id_bg, "asset_id": asset_id_bg })); }
            Err(e) if e == "cancelled" => { let _ = app.emit("transcription:cancelled", serde_json::json!({ "job_id": job_id_bg, "asset_id": asset_id_bg })); }
            Err(e) => { let _ = app.emit("transcription:error", serde_json::json!({ "job_id": job_id_bg, "asset_id": asset_id_bg, "error": e })); }
        }
    });
    Ok(StartTranscriptionResult { job_id })
}

async fn run_transcription(
    app: &tauri::AppHandle, job_id: &str, asset_id: &str, asset_path: &str,
    model_name: &str, model_path: &str, whisper_path: &str, language: &str, prompt: &str,
    duration_ms: Option<i64>, db: &Arc<Mutex<rusqlite::Connection>>,
    child_holder: &Arc<Mutex<Option<std::process::Child>>>,
) -> Result<(), String> {
    let tmp_wav  = format!("/tmp/mam_transcribe_{}.wav",  job_id);
    let tmp_out  = format!("/tmp/mam_transcribe_{}",      job_id);
    let tmp_json = format!("{}.json",                     tmp_out);

    let _ = app.emit("transcription:progress", serde_json::json!({ "job_id": job_id, "asset_id": asset_id, "percent": 0 }));

    job::extract_audio(asset_path, &tmp_wav)?;

    let _ = app.emit("transcription:progress", serde_json::json!({ "job_id": job_id, "asset_id": asset_id, "percent": 10 }));

    let lang = if language == "auto" { "auto" } else { language };
    let mut args = vec!["-m", model_path, "-f", &tmp_wav, "--language", lang, "--output-json", "-of", &tmp_out];
    if !prompt.is_empty() { args.push("--prompt"); args.push(prompt); }

    let child = Command::new(whisper_path)
        .args(&args).stdout(Stdio::null()).stderr(Stdio::null())
        .spawn().map_err(|e| format!("Failed to start whisper-cli: {}", e))?;

    { let mut h = child_holder.lock().map_err(|e| e.to_string())?; *h = Some(child); }

    let rtf = models::get_rtf(model_name);
    let estimated_secs = (duration_ms.unwrap_or(0) as f64 / 1000.0 * rtf as f64).max(1.0);
    let start = std::time::Instant::now();

    loop {
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        let status = {
            let mut h = child_holder.lock().map_err(|e| e.to_string())?;
            if let Some(ref mut c) = *h { c.try_wait().map_err(|e| e.to_string())? }
            else { return Err("cancelled".to_string()); }
        };
        match status {
            Some(exit) => {
                if !exit.success() {
                    let _ = std::fs::remove_file(&tmp_wav);
                    let _ = std::fs::remove_file(&tmp_json);
                    return Err("whisper-cli exited with error".to_string());
                }
                break;
            }
            None => {
                let elapsed = start.elapsed().as_secs_f64();
                let pct = ((elapsed / estimated_secs) * 80.0).min(80.0) as u8 + 10;
                let _ = app.emit("transcription:progress", serde_json::json!({ "job_id": job_id, "asset_id": asset_id, "percent": pct }));
            }
        }
    }

    let _ = app.emit("transcription:progress", serde_json::json!({ "job_id": job_id, "asset_id": asset_id, "percent": 95 }));

    let (detected_lang, segments) = job::parse_whisper_json(&tmp_json)?;
    { let conn = db.lock().map_err(|e| e.to_string())?; job::save_transcript(&conn, asset_id, model_name, language, &detected_lang, &segments, duration_ms)?; }

    let _ = std::fs::remove_file(&tmp_wav);
    let _ = std::fs::remove_file(&tmp_json);
    Ok(())
}

#[tauri::command]
pub async fn transcription_cancel(
    transcription_state: tauri::State<'_, job::TranscriptionState>, job_id: String,
) -> Result<bool, String> {
    let jobs = transcription_state.active_jobs.lock().map_err(|e| e.to_string())?;
    if let Some(holder) = jobs.get(&job_id) {
        let mut child_opt = holder.lock().map_err(|e| e.to_string())?;
        if let Some(ref mut child) = *child_opt {
            child.kill().map_err(|e| e.to_string())?;
            *child_opt = None;
            return Ok(true);
        }
    }
    Ok(false)
}

#[tauri::command]
pub async fn transcription_get(
    state: tauri::State<'_, AppState>, asset_id: String,
) -> Result<Option<job::Transcript>, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    job::get_transcript(&conn, &asset_id)
}

#[tauri::command]
pub async fn transcription_delete(
    state: tauri::State<'_, AppState>, asset_id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM transcripts WHERE asset_id = ?1", rusqlite::params![asset_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
