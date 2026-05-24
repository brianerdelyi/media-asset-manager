import { invoke } from '@tauri-apps/api/core';

export interface Keyword {
  id: string;
  phrase: string;
  label: string;
}

export interface AutoMarkResult {
  markers_created: number;
  matched_keywords: string[];
}

export async function keywordList(): Promise<Keyword[]> {
  return invoke<Keyword[]>('keyword_list');
}

export async function keywordSave(keywords: Keyword[]): Promise<void> {
  return invoke<void>('keyword_save', { keywords });
}

export async function automarkRun(assetId: string): Promise<AutoMarkResult> {
  return invoke<AutoMarkResult>('automark_run', { assetId });
}
