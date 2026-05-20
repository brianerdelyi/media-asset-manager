// Typed Tauri command wrappers for indexing operations.

import { invoke } from '@tauri-apps/api/core';
import type { StartIndexingResult } from '../types/indexing';

export async function startIndexing(
  driveId: string,
  incremental: boolean = true
): Promise<StartIndexingResult> {
  return invoke<StartIndexingResult>('index_start', { driveId, incremental });
}

export async function cancelIndexing(jobId: string): Promise<boolean> {
  return invoke<boolean>('index_cancel', { jobId });
}

export async function cleanupIndexing(jobId: string): Promise<void> {
  return invoke<void>('index_cleanup', { jobId });
}
