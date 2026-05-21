// Typed Tauri command wrappers for marker operations.

import { invoke } from '@tauri-apps/api/core';
import type { AssetMarker } from '../types/asset';

export interface CreateMarkerParams {
  asset_id: string;
  name: string;
  marker_type: 'point' | 'clip';
  position_ms: number;
  end_position_ms?: number;
}

export interface UpdateMarkerParams {
  name?: string;
  position_ms?: number;
  end_position_ms?: number;
}

export async function createMarker(params: CreateMarkerParams): Promise<AssetMarker> {
  return invoke<AssetMarker>('marker_create', { params });
}

export async function updateMarker(markerId: string, params: UpdateMarkerParams): Promise<AssetMarker> {
  return invoke<AssetMarker>('marker_update', { markerId, params });
}

export async function deleteMarker(markerId: string): Promise<void> {
  return invoke<void>('marker_delete', { markerId });
}
