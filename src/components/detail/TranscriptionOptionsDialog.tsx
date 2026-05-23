// TranscriptionOptionsDialog — shown when user clicks "Generate Transcript".
// Lets user choose model, language, prompt, and shows estimated duration.

import { useState, useEffect } from 'react';
import { Mic, Clock } from 'lucide-react';
import { Button } from '../common/Button';
import { useTranscriptionStore } from '../../stores/transcriptionStore';
import { transcriptionEstimate } from '../../commands/transcription';
import { formatDuration } from '../../utils/formatters';

const LANGUAGES = [
  { code: 'auto', label: 'Auto-detect' },
  { code: 'en',   label: 'English' },
  { code: 'fr',   label: 'French' },
  { code: 'es',   label: 'Spanish' },
  { code: 'de',   label: 'German' },
  { code: 'it',   label: 'Italian' },
  { code: 'pt',   label: 'Portuguese' },
  { code: 'ja',   label: 'Japanese' },
  { code: 'ko',   label: 'Korean' },
  { code: 'zh',   label: 'Chinese (Simplified)' },
  { code: 'ar',   label: 'Arabic' },
  { code: 'hi',   label: 'Hindi' },
  { code: 'ru',   label: 'Russian' },
  { code: 'nl',   label: 'Dutch' },
  { code: 'pl',   label: 'Polish' },
  { code: 'sv',   label: 'Swedish' },
  { code: 'tr',   label: 'Turkish' },
];

interface TranscriptionOptionsDialogProps {
  assetId: string;
  assetName: string;
  durationMs: number | null;
  onStart: (model: string, language: string, prompt: string) => void;
  onCancel: () => void;
}

export function TranscriptionOptionsDialog({
  assetId, assetName, durationMs, onStart, onCancel,
}: TranscriptionOptionsDialogProps) {
  const { models } = useTranscriptionStore();
  const installedModels = models.filter(m => m.installed);

  const [selectedModel, setSelectedModel] = useState(installedModels[0]?.name ?? '');
  const [language, setLanguage] = useState('auto');
  const [prompt, setPrompt] = useState('');
  const [estimatedSeconds, setEstimatedSeconds] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);

  const INPUT_STYLE: React.CSSProperties = {
    width: '100%', background: 'var(--bg-raised)',
    border: '1px solid var(--border-default)',
    borderRadius: '6px', padding: '6px 8px',
    fontSize: '12px', color: 'var(--text-primary)',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  // Fetch estimate whenever model changes
  useEffect(() => {
    if (!selectedModel || !assetId) return;
    setEstimating(true);
    transcriptionEstimate(assetId, selectedModel)
      .then(r => setEstimatedSeconds(r.estimated_seconds))
      .catch(() => setEstimatedSeconds(null))
      .finally(() => setEstimating(false));
  }, [selectedModel, assetId]);

  function formatEstimate(secs: number): string {
    if (secs < 60) return `~${secs}s`;
    const mins = Math.round(secs / 60);
    return `~${mins} min`;
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }}>
      <div style={{
        width: '400px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            Generate Transcript
          </h2>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Asset info */}
          <div style={{ background: 'var(--bg-raised)', borderRadius: '6px', padding: '10px 12px' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {assetName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {durationMs && (
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Duration: {formatDuration(durationMs)}
                </span>
              )}
              {estimatedSeconds !== null && (
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={10} /> Est. {estimating ? '…' : formatEstimate(estimatedSeconds)}
                </span>
              )}
            </div>
          </div>

          {/* Model */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Model
            </label>
            {installedModels.length === 0 ? (
              <div style={{ padding: '8px 10px', background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '6px', fontSize: '12px', color: 'var(--color-danger)' }}>
                No models installed — download one in Settings
              </div>
            ) : (
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              >
                {installedModels.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name} (~{Math.round(m.rtf * 60)}s per minute)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Language */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Language
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ ...INPUT_STYLE, cursor: 'pointer' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Prompt */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Initial Prompt <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)' }}>(optional)</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. GoPro, DJI, Toronto, proper nouns, domain vocabulary…"
              rows={3}
              style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.5 }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
            />
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '4px 0 0', lineHeight: 1.4 }}>
              Helps improve accuracy and reduces hallucinations by providing context to the model.
            </p>
          </div>

        </div>

        {/* Actions */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'flex-end', gap: '8px',
        }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary" size="sm"
            disabled={!selectedModel || installedModels.length === 0}
            onClick={() => onStart(selectedModel, language, prompt)}
          >
            <Mic size={12} /> Start Transcription
          </Button>
        </div>
      </div>
    </div>
  );
}
