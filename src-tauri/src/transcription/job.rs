//! Transcription job runner — FFmpeg audio extraction + whisper-cli transcription.
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use uuid::Uuid;

/// Manages active transcription subprocesses for cancellation.
pub struct TranscriptionState {
    pub active_jobs: Mutex<HashMap<String, Arc<Mutex<Option<Child>>>>>,
}

impl TranscriptionState {
    pub fn new() -> Self {
        Self { active_jobs: Mutex::new(HashMap::new()) }
    }
}

/// A parsed transcript segment from whisper-cli JSON output.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Segment {
    pub start_ms: i64,
    pub end_ms: i64,
    pub text: String,
}

/// Full transcript as stored in the database.
#[derive(Debug, Serialize, Clone)]
pub struct Transcript {
    pub id: String,
    pub asset_id: String,
    pub engine: String,
    pub model: String,
    pub language: Option<String>,
    pub detected_lang: Option<String>,
    pub segments: Vec<Segment>,
    pub created_at: i64,
    pub duration_ms: Option<i64>,
}

// ── whisper-cli JSON output structures ──────────────────────────────────────

#[derive(Deserialize)]
pub struct WhisperOutput {
    pub result: WhisperResult,
    pub transcription: Vec<WhisperSegment>,
}

#[derive(Deserialize)]
pub struct WhisperResult {
    pub language: String,
}

#[derive(Deserialize)]
pub struct WhisperSegment {
    pub offsets: WhisperOffsets,
    pub text: String,
}

#[derive(Deserialize)]
pub struct WhisperOffsets {
    pub from: i64,
    pub to: i64,
}

// ── Core functions ────────────────────────────────────────────────────────────

/// Extract audio from a video file to a temp WAV using FFmpeg.
pub fn extract_audio(asset_path: &str, wav_path: &str) -> Result<(), String> {
    let status = Command::new("ffmpeg")
        .args([
            "-y",                 // overwrite output
            "-i", asset_path,
            "-ar", "16000",       // 16kHz sample rate (required by Whisper)
            "-ac", "1",           // mono
            "-f", "wav",
            wav_path,
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map_err(|e| format!("Failed to run ffmpeg: {}", e))?;

    if !status.success() {
        return Err("FFmpeg audio extraction failed".to_string());
    }
    Ok(())
}

/// Parse whisper-cli JSON output into Segment vec.
pub fn parse_whisper_json(json_path: &str) -> Result<(String, Vec<Segment>), String> {
    let content = std::fs::read_to_string(json_path)
        .map_err(|e| format!("Failed to read transcript JSON: {}", e))?;

    let output: WhisperOutput = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse transcript JSON: {}", e))?;

    let detected_lang = output.result.language;
    let segments: Vec<Segment> = output.transcription.into_iter().map(|s| Segment {
        start_ms: s.offsets.from,
        end_ms: s.offsets.to,
        text: s.text.trim().to_string(),
    }).collect();

    Ok((detected_lang, segments))
}

/// Save a transcript to the database.
pub fn save_transcript(
    conn: &rusqlite::Connection,
    asset_id: &str,
    model: &str,
    language: &str,
    detected_lang: &str,
    segments: &[Segment],
    duration_ms: Option<i64>,
) -> Result<String, String> {
    // Remove existing transcript for this asset (re-transcription)
    conn.execute("DELETE FROM transcripts WHERE asset_id = ?1", rusqlite::params![asset_id])
        .map_err(|e| e.to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = now_secs();
    let segments_json = serde_json::to_string(segments)
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO transcripts (id, asset_id, engine, model, language, detected_lang, segments, created_at, duration_ms)
         VALUES (?1, ?2, 'whisper.cpp', ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![id, asset_id, model, language, detected_lang, segments_json, now, duration_ms],
    ).map_err(|e| e.to_string())?;

    Ok(id)
}

/// Retrieve a transcript for an asset from the database.
pub fn get_transcript(
    conn: &rusqlite::Connection,
    asset_id: &str,
) -> Result<Option<Transcript>, String> {
    let result = conn.query_row(
        "SELECT id, asset_id, engine, model, language, detected_lang, segments, created_at, duration_ms
         FROM transcripts WHERE asset_id = ?1",
        rusqlite::params![asset_id],
        |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, Option<String>>(4)?,
                row.get::<_, Option<String>>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, i64>(7)?,
                row.get::<_, Option<i64>>(8)?,
            ))
        },
    );

    match result {
        Ok((id, asset_id, engine, model, language, detected_lang, segments_json, created_at, duration_ms)) => {
            let segments: Vec<Segment> = serde_json::from_str(&segments_json)
                .map_err(|e| e.to_string())?;
            Ok(Some(Transcript { id, asset_id, engine, model, language, detected_lang, segments, created_at, duration_ms }))
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
