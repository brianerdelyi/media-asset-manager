//! Drive model — matches the drives table schema.
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Drive {
    pub id: String,
    pub friendly_name: String,
    pub platform_uuid: String,
    pub drive_type: String,
    pub root_path: String,
    pub is_online: bool,
    pub registered_at: i64,
    pub last_seen_at: Option<i64>,
    pub asset_count: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DriveRemovePreview {
    pub orphaned_asset_count: i64,
    pub affected_asset_count: i64,
    pub requires_confirmation: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DriveRemoveResult {
    pub removed_locations: i64,
    pub deleted_assets: i64,
    pub orphaned_assets: i64,
}
