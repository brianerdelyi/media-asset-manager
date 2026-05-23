//! Database connection management.
use rusqlite::{Connection, OpenFlags};
use std::path::Path;

/// Open (or create) the SQLite database at the given path.
/// Enables WAL mode and runs all pending migrations.
pub fn open(db_path: &Path) -> Result<Connection, crate::error::AppError> {
    let conn = Connection::open(db_path)
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    conn.execute_batch("PRAGMA journal_mode=WAL;")
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    conn.execute_batch("PRAGMA foreign_keys=ON;")
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    crate::db::migrations::run(&conn)?;

    Ok(conn)
}

/// Open a read-only connection to an existing database.
/// Used for search queries — never blocks the write connection.
pub fn open_readonly(db_path: &Path) -> Result<Connection, crate::error::AppError> {
    let conn = Connection::open_with_flags(
        db_path,
        OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    conn.execute_batch("PRAGMA foreign_keys=ON;")
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    Ok(conn)
}

/// Open a dedicated write connection for the indexer.
/// Separate from the UI write connection so indexing never blocks UI commands.
pub fn open_for_indexer(db_path: &Path) -> Result<Connection, crate::error::AppError> {
    let conn = Connection::open(db_path)
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    conn.execute_batch("PRAGMA journal_mode=WAL;")
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    conn.execute_batch("PRAGMA foreign_keys=ON;")
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    // Longer busy timeout for indexer — allows WAL checkpoints to complete
    conn.busy_timeout(std::time::Duration::from_secs(30))
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    Ok(conn)
}
