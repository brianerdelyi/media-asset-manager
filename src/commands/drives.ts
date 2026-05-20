import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { Drive, DriveRemovePreview, DriveRemoveResult } from '../types/drive';

export async function registerDrive(path: string, friendlyName: string): Promise<Drive> {
  return invoke<Drive>('drive_register', { path, friendlyName });
}

export async function listDrives(): Promise<Drive[]> {
  return invoke<Drive[]>('drive_list');
}

export async function previewRemoveDrive(driveId: string): Promise<DriveRemovePreview> {
  return invoke<DriveRemovePreview>('drive_remove', { driveId });
}

export async function confirmRemoveDrive(driveId: string, deleteOrphanedAssets: boolean): Promise<DriveRemoveResult> {
  return invoke<DriveRemoveResult>('drive_remove_confirm', { driveId, deleteOrphanedAssets });
}

export async function renameDrive(driveId: string, friendlyName: string): Promise<Drive> {
  return invoke<Drive>('drive_rename', { driveId, friendlyName });
}

export async function selectFolder(): Promise<string | null> {
  const result = await open({ directory: true, multiple: false, title: 'Select a drive or folder to register' });
  if (Array.isArray(result)) return result[0] ?? null;
  return result;
}
