//! Content fingerprint computation for duplicate detection.
//!
//! For files > 128KB: SHA256(first 64KB + last 64KB)
//! For files <= 128KB: SHA256(entire file)
//!
//! Reads at most 128KB regardless of file size — practical for 25GB+ video files.

use sha2::{Sha256, Digest};
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

const CHUNK_SIZE: u64 = 64 * 1024; // 64KB
const THRESHOLD: u64 = 128 * 1024; // 128KB

/// Compute a content fingerprint for the file at the given path.
/// Returns a hex-encoded SHA256 string.
pub fn compute_fingerprint(path: &Path) -> Result<String, crate::error::AppError> {
    let mut file = std::fs::File::open(path)
        .map_err(|e| crate::error::AppError::Filesystem(format!("Cannot open file: {}", e)))?;

    let file_size = file.metadata()
        .map_err(|e| crate::error::AppError::Filesystem(format!("Cannot read metadata: {}", e)))?
        .len();

    let mut hasher = Sha256::new();

    if file_size <= THRESHOLD {
        // Small file — hash entire contents
        let mut buf = Vec::new();
        file.read_to_end(&mut buf)
            .map_err(|e| crate::error::AppError::Filesystem(format!("Cannot read file: {}", e)))?;
        hasher.update(&buf);
    } else {
        // Large file — hash first 64KB + last 64KB
        let mut buf = vec![0u8; CHUNK_SIZE as usize];

        // First chunk
        let n = file.read(&mut buf)
            .map_err(|e| crate::error::AppError::Filesystem(format!("Cannot read file: {}", e)))?;
        hasher.update(&buf[..n]);

        // Last chunk
        file.seek(SeekFrom::End(-(CHUNK_SIZE as i64)))
            .map_err(|e| crate::error::AppError::Filesystem(format!("Cannot seek file: {}", e)))?;
        let n = file.read(&mut buf)
            .map_err(|e| crate::error::AppError::Filesystem(format!("Cannot read file: {}", e)))?;
        hasher.update(&buf[..n]);
    }

    let result = hasher.finalize();
    Ok(hex::encode(result))
}
