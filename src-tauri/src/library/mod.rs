//! Library management — resolves library root path and initializes the database.
use std::path::PathBuf;

pub fn resolve_library_path() -> Result<PathBuf, crate::error::AppError> {
    let base = dirs::data_dir().ok_or_else(|| {
        crate::error::AppError::Filesystem("Could not resolve app data directory".to_string())
    })?;
    let library_path = base.join("media-asset-manager");
    std::fs::create_dir_all(&library_path).map_err(|e| {
        crate::error::AppError::Filesystem(format!("Could not create library directory: {}", e))
    })?;
    Ok(library_path)
}

pub fn resolve_db_path() -> Result<PathBuf, crate::error::AppError> {
    Ok(resolve_library_path()?.join("library.db"))
}

pub fn resolve_thumbnails_path() -> Result<PathBuf, crate::error::AppError> {
    let thumbnails_path = resolve_library_path()?.join("thumbnails");
    std::fs::create_dir_all(&thumbnails_path).map_err(|e| {
        crate::error::AppError::Filesystem(format!("Could not create thumbnails directory: {}", e))
    })?;
    Ok(thumbnails_path)
}
