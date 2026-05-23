//! Tag model.
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name_display: String,
    pub name_normalized: String,
    pub asset_count: i64,
}
