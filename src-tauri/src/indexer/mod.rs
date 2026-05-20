//! Indexing engine module.
pub mod engine;
pub mod hasher;
pub mod metadata;
pub mod thumbnails;

pub use engine::{start_indexing, CancelFlag};
