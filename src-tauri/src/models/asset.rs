//! Asset models — matches the assets, locations tables.
use serde::{Deserialize, Serialize};

/// Asset summary — returned in search results.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetSummary {
    pub id: String,
    pub media_type: String,
    pub file_extension: String,
    pub filename: String,
    pub file_size: i64,
    pub duration_ms: Option<i64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub codec: Option<String>,
    pub created_at_fs: Option<i64>,
    pub thumbnail_path: Option<String>,
    pub is_orphaned: bool,
    pub primary_drive_name: Option<String>,
    pub primary_drive_online: bool,
    pub location_count: i64,
    pub tag_count: i64,
    pub marker_count: i64,
}

/// Full asset detail including locations, tags, and markers.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetDetail {
    pub id: String,
    pub media_type: String,
    pub file_extension: String,
    pub file_size: i64,
    pub duration_ms: Option<i64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub codec: Option<String>,
    pub frame_rate: Option<f64>,
    pub sample_rate: Option<i64>,
    pub created_at_fs: Option<i64>,
    pub modified_at_fs: Option<i64>,
    pub thumbnail_path: Option<String>,
    pub is_orphaned: bool,
    pub locations: Vec<AssetLocation>,
    pub tags: Vec<AssetTag>,
    pub markers: Vec<AssetMarker>,
}

/// A single location record for an asset.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetLocation {
    pub id: String,
    pub drive_id: String,
    pub drive_name: String,
    pub is_online: bool,
    pub file_path: String,
    pub filename: String,
    pub is_missing: bool,
    pub last_seen_at: i64,
}

/// A tag applied to an asset.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetTag {
    pub id: String,
    pub name_display: String,
    pub name_normalized: String,
}

/// A marker on a video asset.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetMarker {
    pub id: String,
    pub name: String,
    pub marker_type: String,
    pub position_ms: i64,
    pub end_position_ms: Option<i64>,
}

/// Search filters.
#[derive(Debug, Deserialize, Default)]
pub struct AssetSearchFilters {
    pub query: Option<String>,
    pub media_types: Option<Vec<String>>,
    pub drive_ids: Option<Vec<String>>,
    pub date_from: Option<i64>,
    pub date_to: Option<i64>,
    pub has_markers: Option<bool>,
    pub status: Option<String>,
    pub tag_ids: Option<Vec<String>>,
}

/// Sort options.
#[derive(Debug, Deserialize)]
pub struct AssetSort {
    pub field: String,
    pub direction: String,
}

/// Paginated search result.
#[derive(Debug, Serialize)]
pub struct AssetSearchResult {
    pub data: Vec<AssetSummary>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}
