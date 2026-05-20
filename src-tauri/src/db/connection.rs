//! Database connection management.
use rusqlite::Connection;
use std::path::Path;

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
