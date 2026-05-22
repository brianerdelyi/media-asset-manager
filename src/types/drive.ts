export interface Drive {
  id: string;
  friendly_name: string;
  platform_uuid: string;
  drive_type: 'local' | 'network';
  root_path: string;
  is_online: boolean;
  registered_at: number;
  last_seen_at: number | null;
  asset_count: number | null;
  index_media_types: string; // comma-separated: "video,image,audio"
}

export interface DriveRemovePreview {
  orphaned_asset_count: number;
  affected_asset_count: number;
  requires_confirmation: boolean;
}

export interface DriveRemoveResult {
  removed_locations: number;
  deleted_assets: number;
  orphaned_assets: number;
}
