//! Application error type.
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),
    #[error("Filesystem error: {0}")]
    Filesystem(String),
    #[error("Not implemented: {0}")]
    NotImplemented(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Invalid parameters: {0}")]
    InvalidParameters(String),
}
