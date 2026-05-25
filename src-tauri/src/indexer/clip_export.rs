//! Lossless clip export via FFmpeg stream copy.
//!
//! Extracts a clip between In and Out marker timestamps using FFmpeg -c copy.
//! No transcoding — video and audio streams are copied byte-for-byte.
//! Output is a new file; the original is never modified.
//!
//! -map_metadata 0       — copy all container-level metadata
//! -map 0                — copy all streams from input
//! -movflags use_metadata_tags — preserve stream side data including
//!                         Display Matrix rotation (critical for DJI/GoPro
//!                         footage that stores orientation as side data)

use std::path::Path;

/// Export a lossless clip from a source file between in_ms and out_ms.
pub fn export_clip(
    source_path: &Path,
    output_path: &Path,
    in_ms: i64,
    out_ms: i64,
) -> Result<(), crate::error::AppError> {
    if out_ms <= in_ms {
        return Err(crate::error::AppError::InvalidParameters(
            "Out point must be after In point".to_string()
        ));
    }

    let ffmpeg = crate::indexer::metadata::find_ffmpeg()?;

    let in_secs  = format!("{:.3}", in_ms  as f64 / 1000.0);
    let out_secs = format!("{:.3}", out_ms as f64 / 1000.0);

    let status = std::process::Command::new(&ffmpeg)
        .args([
            "-ss", &in_secs,
            "-to", &out_secs,
            "-i", source_path.to_str().unwrap_or(""),
            "-map", "0",                        // copy all streams
            "-c", "copy",                       // stream copy — no transcoding
            "-map_metadata", "0",               // copy container-level metadata
            "-movflags", "use_metadata_tags",   // preserve stream side data
                                                // including Display Matrix rotation
                                                // used by DJI/GoPro/iPhone
            "-avoid_negative_ts", "make_zero",
            "-y",
            output_path.to_str().unwrap_or(""),
        ])
        .status()
        .map_err(|e| crate::error::AppError::Filesystem(
            format!("FFmpeg failed to start: {}", e)
        ))?;

    if !status.success() {
        return Err(crate::error::AppError::Filesystem(
            "FFmpeg clip export failed — check that the source file is accessible".to_string()
        ));
    }

    Ok(())
}
