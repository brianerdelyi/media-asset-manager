// Indexing types

export interface StartIndexingResult {
  job_id: string;
}

export interface IndexingProgressEvent {
  job_id: string;
  drive_id: string;
  files_found: number;
  files_indexed: number;
  files_skipped: number;
  percent_complete: number;
}

export interface IndexingCompleteEvent {
  job_id: string;
  drive_id: string;
  total_indexed: number;
  total_skipped: number;
  duration_ms: number;
}
