// Asset types — match Rust models exactly

export interface AssetSummary {
  id: string;
  media_type: 'video' | 'image' | 'audio';
  file_extension: string;
  filename: string;
  file_size: number;
  duration_ms: number | null;
  width: number | null;
  height: number | null;
  codec: string | null;
  created_at_fs: number | null;
  thumbnail_path: string | null;
  is_orphaned: boolean;
  primary_drive_name: string | null;
  primary_drive_online: boolean;
  location_count: number;
  tag_count: number;
  marker_count: number;
}

export interface AssetDetail {
  id: string;
  media_type: 'video' | 'image' | 'audio';
  file_extension: string;
  file_size: number;
  duration_ms: number | null;
  width: number | null;
  height: number | null;
  codec: string | null;
  frame_rate: number | null;
  sample_rate: number | null;
  created_at_fs: number | null;
  modified_at_fs: number | null;
  thumbnail_path: string | null;
  is_orphaned: boolean;
  locations: AssetLocation[];
  tags: AssetTag[];
  markers: AssetMarker[];
}

export interface AssetLocation {
  id: string;
  drive_id: string;
  drive_name: string;
  is_online: boolean;
  file_path: string;
  filename: string;
  is_missing: boolean;
  last_seen_at: number;
}

export interface AssetTag {
  id: string;
  name_display: string;
  name_normalized: string;
}

export interface AssetMarker {
  id: string;
  name: string;
  marker_type: 'point' | 'clip';
  position_ms: number;
  end_position_ms: number | null;
}

export interface AssetSearchFilters {
  query?: string;
  media_types?: string[];
  drive_ids?: string[];
  date_from?: number;
  date_to?: number;
  has_markers?: boolean;
  status?: 'all' | 'orphaned' | 'missing';
  tag_ids?: string[];
}

export interface AssetSort {
  field: 'created_at_fs' | 'filename' | 'file_size' | 'media_type';
  direction: 'asc' | 'desc';
}

export interface AssetSearchResult {
  data: AssetSummary[];
  total: number;
  page: number;
  page_size: number;
}
