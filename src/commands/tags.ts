import { invoke } from '@tauri-apps/api/core';
import type { Tag } from '../types/tag';

export async function listTags(): Promise<Tag[]> {
  return invoke<Tag[]>('tag_list');
}

export async function createTag(name: string): Promise<Tag> {
  return invoke<Tag>('tag_create', { name });
}

export async function deleteTag(tagId: string): Promise<void> {
  return invoke<void>('tag_delete', { tagId });
}

export async function setAssetTags(assetId: string, tagIds: string[]): Promise<void> {
  return invoke<void>('asset_tags_set', { assetId, tagIds });
}
