//! whisper-cli binary detection and validation.
use serde::Serialize;
use std::process::Command;

#[derive(Debug, Serialize, Clone)]
pub struct WhisperStatus {
    pub found: bool,
    pub path: Option<String>,
}

/// Searches common paths for whisper-cli binary.
pub fn find_whisper_cli() -> WhisperStatus {
    let candidates = [
        "/opt/homebrew/bin/whisper-cli",  // Apple Silicon Homebrew
        "/usr/local/bin/whisper-cli",     // Intel Homebrew
        "whisper-cli",                    // PATH fallback
    ];

    for candidate in &candidates {
        if check_whisper_cli(candidate) {
            return WhisperStatus {
                found: true,
                path: Some(candidate.to_string()),
            };
        }
    }

    WhisperStatus { found: false, path: None }
}

/// Validates that a whisper-cli binary exists and is executable.
fn check_whisper_cli(path: &str) -> bool {
    Command::new(path)
        .arg("--help")
        .output()
        .map(|o| o.status.success() || !o.stderr.is_empty()) // --help exits 0 or prints to stderr
        .unwrap_or(false)
}

/// Resolves the models directory path.
pub fn resolve_models_path() -> Result<std::path::PathBuf, String> {
    let base = dirs::data_dir()
        .ok_or_else(|| "Cannot resolve data directory".to_string())?;
    let models_dir = base.join("media-asset-manager").join("models");
    std::fs::create_dir_all(&models_dir)
        .map_err(|e| e.to_string())?;
    Ok(models_dir)
}
