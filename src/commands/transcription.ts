import { invoke } from '@tauri-apps/api/core';

export interface WhisperStatus {
  found: boolean;
  path: string | null;
}

export interface ModelInfo {
  name: string;
  filename: string;
  size_bytes: number;
  installed: boolean;
  path: string | null;
  rtf: number;
}

export interface TranscriptSegment {
  start_ms: number;
  end_ms: number;
  text: string;
}

export interface Transcript {
  id: string;
  asset_id: string;
  engine: string;
  model: string;
  language: string | null;
  detected_lang: string | null;
  segments: TranscriptSegment[];
  created_at: number;
  duration_ms: number | null;
}

export interface StartTranscriptionResult {
  job_id: string;
}

export interface EstimateResult {
  estimated_seconds: number;
}

export async function checkEnvironment(): Promise<WhisperStatus> {
  return invoke<WhisperStatus>('transcription_check_environment');
}

export async function listModels(): Promise<ModelInfo[]> {
  return invoke<ModelInfo[]>('model_list');
}

export async function deleteModel(modelName: string): Promise<void> {
  return invoke<void>('model_delete', { modelName });
}

export async function downloadModel(modelName: string): Promise<void> {
  return invoke<void>('model_download', { modelName });
}

export async function transcriptionEstimate(
  assetId: string,
  modelName: string,
): Promise<EstimateResult> {
  return invoke<EstimateResult>('transcription_estimate', { assetId, modelName });
}

export async function transcriptionStart(
  assetId: string,
  modelName: string,
  language: string,
  prompt: string,
): Promise<StartTranscriptionResult> {
  return invoke<StartTranscriptionResult>('transcription_start', {
    assetId, modelName, language, prompt,
  });
}

export async function transcriptionCancel(jobId: string): Promise<boolean> {
  return invoke<boolean>('transcription_cancel', { jobId });
}

export async function transcriptionGet(assetId: string): Promise<Transcript | null> {
  return invoke<Transcript | null>('transcription_get', { assetId });
}

export async function transcriptionDelete(assetId: string): Promise<void> {
  return invoke<void>('transcription_delete', { assetId });
}
