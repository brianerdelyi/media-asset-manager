//! Thumbnail generation via FFmpeg.

use std::path::Path;

/// Generate a WebP thumbnail for a media file.
/// Returns the FULL absolute path to the thumbnail file.
pub fn generate_thumbnail(
    asset_id: &str,
    source_path: &Path,
    media_type: &str,
    duration_ms: Option<i64>,
    thumbnails_dir: &Path,
) -> Result<String, crate::error::AppError> {
    let ffmpeg = crate::indexer::metadata::find_ffmpeg()?;

    let thumb_filename = format!("{}.webp", asset_id);
    let thumb_path = thumbnails_dir.join(&thumb_filename);

    // Skip if thumbnail already exists
    if thumb_path.exists() {
        return Ok(thumb_path.to_string_lossy().to_string());
    }

    let success = match media_type {
        "video" => generate_video_thumbnail(&ffmpeg, source_path, &thumb_path, duration_ms),
        "image" => generate_image_thumbnail(&ffmpeg, source_path, &thumb_path),
        _ => return Err(crate::error::AppError::InvalidParameters(
            format!("Thumbnails not supported for media type: {}", media_type)
        )),
    };

    success?;

    if thumb_path.exists() {
        Ok(thumb_path.to_string_lossy().to_string())
    } else {
        Err(crate::error::AppError::Filesystem(
            "FFmpeg did not produce a thumbnail file".to_string()
        ))
    }
}

fn generate_video_thumbnail(
    ffmpeg: &Path,
    source: &Path,
    output: &Path,
    duration_ms: Option<i64>,
) -> Result<(), crate::error::AppError> {
    let seek_secs = duration_ms
        .map(|ms| (ms as f64 / 1000.0 * 0.1).max(1.0))
        .unwrap_or(1.0);

    let status = std::process::Command::new(ffmpeg)
        .args([
            "-ss", &format!("{:.2}", seek_secs),
            "-i", source.to_str().unwrap_or(""),
            "-vframes", "1",
            "-vf", "scale=320:-2:flags=lanczos",
            "-q:v", "75",
            "-y",
            output.to_str().unwrap_or(""),
        ])
        .status()
        .map_err(|e| crate::error::AppError::Filesystem(format!("FFmpeg failed: {}", e)))?;

    if !status.success() {
        return Err(crate::error::AppError::Filesystem(
            "FFmpeg returned non-zero exit code during thumbnail generation".to_string()
        ));
    }

    Ok(())
}

fn generate_image_thumbnail(
    ffmpeg: &Path,
    source: &Path,
    output: &Path,
) -> Result<(), crate::error::AppError> {
    let status = std::process::Command::new(ffmpeg)
        .args([
            "-i", source.to_str().unwrap_or(""),
            "-vf", "scale=320:-2:flags=lanczos",
            "-q:v", "75",
            "-y",
            output.to_str().unwrap_or(""),
        ])
        .status()
        .map_err(|e| crate::error::AppError::Filesystem(format!("FFmpeg failed: {}", e)))?;

    if !status.success() {
        return Err(crate::error::AppError::Filesystem(
            "FFmpeg returned non-zero exit code during image thumbnail generation".to_string()
        ));
    }

    Ok(())
}

pub fn delete_thumbnail(thumbnail_path: &str) -> Result<(), crate::error::AppError> {
    let path = std::path::Path::new(thumbnail_path);
    if path.exists() {
        std::fs::remove_file(path)
            .map_err(|e| crate::error::AppError::Filesystem(e.to_string()))?;
    }
    Ok(())
}

pub fn purge_all_thumbnails(thumbnails_dir: &Path) -> Result<u64, crate::error::AppError> {
    let mut count = 0u64;
    let entries = std::fs::read_dir(thumbnails_dir)
        .map_err(|e| crate::error::AppError::Filesystem(e.to_string()))?;

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("webp") {
            std::fs::remove_file(&path)
                .map_err(|e| crate::error::AppError::Filesystem(e.to_string()))?;
            count += 1;
        }
    }

    Ok(count)
}
