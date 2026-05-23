// TranscriptPanel — scrollable timestamped segments with click-to-seek.
// Active segment highlights as video plays. Copy button copies plain text.

import { useEffect, useRef } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import type { Transcript, TranscriptSegment } from '../../commands/transcription';
import { showToast } from '../../stores/toastStore';

interface TranscriptPanelProps {
  transcript: Transcript;
  currentMs: number;
  onSeek: (ms: number) => void;
  onRetranscribe: () => void;
}

function formatTimestamp(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getActiveSegmentIndex(segments: TranscriptSegment[], currentMs: number): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (currentMs >= segments[i].start_ms) return i;
  }
  return -1;
}

export function TranscriptPanel({ transcript, currentMs, onSeek, onRetranscribe }: TranscriptPanelProps) {
  const activeIndex = getActiveSegmentIndex(transcript.segments, currentMs);
  const activeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active segment into view
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = activeRef.current;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;
      if (elTop < containerTop || elBottom > containerBottom) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  function copyTranscript() {
    const text = transcript.segments.map(s => s.text).join(' ');
    navigator.clipboard.writeText(text).then(() => {
      showToast('Transcript copied to clipboard.', 'success');
    }).catch(() => {
      showToast('Failed to copy transcript.', 'error');
    });
  }

  const detectedLang = transcript.detected_lang ?? transcript.language ?? '';
  const subtitle = [transcript.model, detectedLang].filter(Boolean).join(' · ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          Transcript
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={copyTranscript} title="Copy transcript"
            style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <Copy size={11} />
          </button>
          <button onClick={onRetranscribe} title="Re-transcribe"
            style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>

      {/* Engine/model subtitle */}
      {subtitle && (
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
          {subtitle}
        </p>
      )}

      {/* Segments */}
      {transcript.segments.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0, padding: '8px 0' }}>
          No speech detected in this clip.
        </p>
      ) : (
        <div
          ref={containerRef}
          style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}
        >
          {transcript.segments.map((seg, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSeek(seg.start_ms)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '5px 6px', borderRadius: '4px',
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                  color: isActive ? 'var(--color-accent)' : 'var(--text-tertiary)',
                  flexShrink: 0, marginTop: '1px', minWidth: '34px',
                }}>
                  {formatTimestamp(seg.start_ms)}
                </span>
                <span style={{
                  fontSize: '12px', lineHeight: 1.5,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}>
                  {seg.text}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
