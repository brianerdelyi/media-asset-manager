//! Media metadata extraction.
//!
//! Uses ffprobe for metadata extraction (reads headers only, very fast).
//! Uses FFmpeg for thumbnail generation (requires frame decoding).
//!
//! Binary resolution order:
//! 1. Bundled sidecar next to executable (production)
//! 2. Homebrew at /opt/homebrew/bin/ (Apple Silicon dev)
//! 3. Homebrew at /usr/local/bin/ (Intel Mac dev)

use std::path::Path;
use serde::Deserialize;

/// Structured metadata extracted from a media file.
#[derive(Debug, Default)]
pub struct MediaMetadata {
    pub media_type: String,
    pub duration_ms: Option<i64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub codec: Option<String>,
    pub frame_rate: Option<f64>,
    pub sample_rate: Option<i64>,
    pub created_at_fs: Option<i64>,
    pub modified_at_fs: Option<i64>,
}

const VIDEO_EXTENSIONS: &[&str] = &["mp4", "mov", "mxf", "avi", "mkv", "m4v", "mpg", "mpeg", "webm"];
const IMAGE_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "tiff", "tif", "webp", "heic", "heif", "gif", "bmp"];
const AUDIO_EXTENSIONS: &[&str] = &["wav", "mp3", "aiff", "aif", "aac", "flac", "m4a", "ogg", "opus"];

pub fn media_type_from_extension(ext: &str) -> Option<&'static str> {
    let ext = ext.to_lowercase();
    if VIDEO_EXTENSIONS.contains(&ext.as_str()) { return Some("video"); }
    if IMAGE_EXTENSIONS.contains(&ext.as_str()) { return Some("image"); }
    if AUDIO_EXTENSIONS.contains(&ext.as_str()) { return Some("audio"); }
    None
}

pub fn is_supported_extension(ext: &str) -> bool {
    media_type_from_extension(ext).is_some()
}

/// Extract metadata from a media file using ffprobe.
pub fn extract_metadata(path: &Path) -> Result<MediaMetadata, crate::error::AppError> {
    let ext = path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let media_type = media_type_from_extension(&ext)
        .ok_or_else(|| crate::error::AppError::InvalidParameters(
            format!("Unsupported file type: {}", ext)
        ))?
        .to_string();

    let fs_meta = std::fs::metadata(path).ok();
    let created_at_fs = fs_meta.as_ref()
        .and_then(|m| m.created().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64);
    let modified_at_fs = fs_meta.as_ref()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64);

    let probe = run_ffprobe(path).unwrap_or_default();

    Ok(MediaMetadata {
        media_type,
        duration_ms: probe.duration_secs.map(|d| (d * 1000.0) as i64),
        width: probe.width,
        height: probe.height,
        codec: probe.codec,
        frame_rate: probe.frame_rate,
        sample_rate: probe.sample_rate,
        created_at_fs,
        modified_at_fs,
    })
}

#[derive(Default)]
struct ProbeOutput {
    duration_secs: Option<f64>,
    width: Option<i64>,
    height: Option<i64>,
    codec: Option<String>,
    frame_rate: Option<f64>,
    sample_rate: Option<i64>,
}

#[derive(Deserialize, Default)]
struct FfprobeJson {
    #[serde(default)]
    streams: Vec<FfprobeStream>,
    #[serde(default)]
    format: FfprobeFormat,
}

#[derive(Deserialize, Default)]
struct FfprobeStream {
    codec_type: Option<String>,
    codec_name: Option<String>,
    width: Option<i64>,
    height: Option<i64>,
    r_frame_rate: Option<String>,
    sample_rate: Option<String>,
    bit_rate: Option<String>,
    #[serde(default)]
    disposition: FfprobeDisposition,
}

#[derive(Deserialize, Default)]
struct FfprobeDisposition {
    #[serde(default)]
    default: i64,
    #[serde(default)]
    attached_pic: i64,
}

#[derive(Deserialize, Default)]
struct FfprobeFormat {
    duration: Option<String>,
}

fn run_ffprobe(path: &Path) -> Result<ProbeOutput, crate::error::AppError> {
    let ffprobe_path = find_ffprobe()?;

    let output = std::process::Command::new(&ffprobe_path)
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            "-show_format",
            path.to_str().unwrap_or(""),
        ])
        .output()
        .map_err(|e| crate::error::AppError::Filesystem(format!("ffprobe failed: {}", e)))?;

    let json: FfprobeJson = serde_json::from_slice(&output.stdout).unwrap_or_default();
    let mut result = ProbeOutput::default();

    result.duration_secs = json.format.duration
        .as_deref()
        .and_then(|d| d.parse::<f64>().ok());

    // Select the best video stream:
    // 1. Prefer the default stream (disposition.default = 1)
    // 2. Skip attached pictures (cover art, thumbnails — disposition.attached_pic = 1)
    // 3. Skip MJPEG streams unless it's the only stream (GoPro embeds MJPEG preview)
    // 4. Among remaining, prefer highest bitrate
    let video_streams: Vec<&FfprobeStream> = json.streams.iter()
        .filter(|s| s.codec_type.as_deref() == Some("video"))
        .filter(|s| s.disposition.attached_pic == 0) // skip cover art
        .collect();

    // Find best video stream — prefer default, then prefer non-mjpeg, then highest bitrate
    let best_video = video_streams.iter()
        .max_by_key(|s| {
            let is_default = s.disposition.default;
            let not_mjpeg = if s.codec_name.as_deref() == Some("mjpeg") { 0i64 } else { 1i64 };
            let bitrate = s.bit_rate.as_deref()
                .and_then(|b| b.parse::<i64>().ok())
                .unwrap_or(0);
            // Score: default status is most important, then non-mjpeg, then bitrate
            (is_default * 1_000_000_000) + (not_mjpeg * 1_000_000) + (bitrate / 1000)
        });

    if let Some(stream) = best_video {
        result.codec = stream.codec_name.clone();
        result.width = stream.width;
        result.height = stream.height;
        result.frame_rate = parse_frame_rate(stream.r_frame_rate.as_deref());
    }

    // Audio stream — first non-attached audio stream
    let best_audio = json.streams.iter()
        .find(|s| s.codec_type.as_deref() == Some("audio")
            && s.disposition.attached_pic == 0);

    if let Some(stream) = best_audio {
        if result.codec.is_none() {
            result.codec = stream.codec_name.clone();
        }
        result.sample_rate = stream.sample_rate.as_deref()
            .and_then(|s| s.parse::<i64>().ok());
    }

    Ok(result)
}

/// Find ffprobe binary.
fn find_ffprobe() -> Result<std::path::PathBuf, crate::error::AppError> {
    // 1. Bundled sidecar (production)
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            for name in &["ffprobe-aarch64-apple-darwin", "ffprobe-x86_64-apple-darwin", "ffprobe"] {
                let p = dir.join(name);
                if p.exists() { return Ok(p); }
            }
        }
    }

    // 2. Homebrew Apple Silicon
    let p = std::path::PathBuf::from("/opt/homebrew/bin/ffprobe");
    if p.exists() { return Ok(p); }

    // 3. Homebrew Intel
    let p = std::path::PathBuf::from("/usr/local/bin/ffprobe");
    if p.exists() { return Ok(p); }

    Err(crate::error::AppError::Filesystem(
        "ffprobe not found. Install via Homebrew: brew install ffmpeg".to_string()
    ))
}

/// Find FFmpeg binary — for thumbnail generation.
pub fn find_ffmpeg() -> Result<std::path::PathBuf, crate::error::AppError> {
    // 1. Bundled sidecar (production)
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            for name in &["ffmpeg-aarch64-apple-darwin", "ffmpeg-x86_64-apple-darwin", "ffmpeg"] {
                let p = dir.join(name);
                if p.exists() { return Ok(p); }
            }
        }
    }

    // 2. Homebrew Apple Silicon
    let p = std::path::PathBuf::from("/opt/homebrew/bin/ffmpeg");
    if p.exists() { return Ok(p); }

    // 3. Homebrew Intel
    let p = std::path::PathBuf::from("/usr/local/bin/ffmpeg");
    if p.exists() { return Ok(p); }

    Err(crate::error::AppError::Filesystem(
        "FFmpeg not found. Install via Homebrew: brew install ffmpeg".to_string()
    ))
}

fn parse_frame_rate(s: Option<&str>) -> Option<f64> {
    let s = s?;
    if s == "0/0" { return None; }
    let parts: Vec<&str> = s.split('/').collect();
    if parts.len() != 2 { return None; }
    let num: f64 = parts[0].parse().ok()?;
    let den: f64 = parts[1].parse().ok()?;
    if den == 0.0 { return None; }
    Some((num / den * 100.0).round() / 100.0)
}
