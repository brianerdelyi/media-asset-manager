// Video player with timeline, playback controls, and marker overlay.

import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Play, Pause, Film } from 'lucide-react';
import type { AssetMarker } from '../../types/asset';
import { formatDuration } from '../../utils/formatters';

interface VideoPlayerProps {
  filePath: string;
  durationMs: number;
  markers: AssetMarker[];
  posterUrl?: string | null;
  minScrubMs?: number | null;
  videoHeight?: number | null;
  onTimeUpdate?: (positionMs: number) => void;
  onMarkerClick?: (positionMs: number) => void;
}

export interface VideoPlayerHandle {
  seekTo: (ms: number) => void;
}

// Layout constants (all px, container height = 32px)
const CONTAINER_H = 32;
const TRACK_Y     = CONTAINER_H / 2;   // 16 — track bar centre
const TRI_TOP     = 1;
const TRI_H       = 9;
const TRI_BOTTOM  = TRI_TOP + TRI_H;   // 10 — triangle base

// Line: from triangle base to track centre = 6px above track
// Double it = 12px, centred on track (6px above + 6px below)
const LINE_TOP    = TRI_BOTTOM;                          // 10
const LINE_H      = (TRACK_Y - TRI_BOTTOM) * 2;         // 12

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({
  filePath, durationMs, markers,
  posterUrl = null, minScrubMs = null, videoHeight = null,
  onTimeUpdate, onMarkerClick,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing,   setPlaying]   = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [seeking,   setSeeking]   = useState(false);
  const [loadError, setLoadError] = useState(false);

  const src = convertFileSrc(filePath);

  useImperativeHandle(ref, () => ({
    seekTo: (ms) => {
      const v = videoRef.current; if (!v) return;
      const c = minScrubMs !== null ? Math.max(ms, minScrubMs) : ms;
      v.currentTime = c / 1000; setCurrentMs(c);
    },
  }));

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const onPlay = () => setPlaying(true), onPause = () => setPlaying(false), onEnded = () => setPlaying(false);
    v.addEventListener('play', onPlay); v.addEventListener('pause', onPause); v.addEventListener('ended', onEnded);
    return () => { v.removeEventListener('play', onPlay); v.removeEventListener('pause', onPause); v.removeEventListener('ended', onEnded); };
  }, []);

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const h = () => {
      let ms = Math.floor(v.currentTime * 1000);
      if (minScrubMs !== null && ms < minScrubMs) { v.currentTime = minScrubMs / 1000; ms = minScrubMs; }
      setCurrentMs(ms); onTimeUpdate?.(ms);
    };
    v.addEventListener('timeupdate', h);
    return () => v.removeEventListener('timeupdate', h);
  }, [minScrubMs, onTimeUpdate]);

  useEffect(() => {
    if (!seeking) { document.body.style.cursor = ''; return; }
    document.body.style.cursor = 'ew-resize';
    const onMove = (e: MouseEvent) => {
      const r = trackRef.current?.getBoundingClientRect(); if (!r) return;
      seekTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * durationMs);
    };
    const onUp = () => { setSeeking(false); document.body.style.cursor = ''; };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [seeking, durationMs, minScrubMs]);

  function togglePlay() { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); }

  function seekTo(ms: number) {
    const v = videoRef.current; if (!v) return;
    const c = minScrubMs !== null ? Math.max(ms, minScrubMs) : ms;
    v.currentTime = c / 1000; setCurrentMs(c); onTimeUpdate?.(c);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const r = trackRef.current?.getBoundingClientRect(); if (!r) return;
    seekTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * durationMs);
    setSeeking(true);
  }

  const pct    = durationMs > 0 ? (currentMs / durationMs) * 100 : 0;
  const minPct = minScrubMs !== null && durationMs > 0 ? (minScrubMs / durationMs) * 100 : null;
  const left   = `max(5px, ${pct}%)`;

  if (loadError) return (
    <div style={{ background: 'var(--bg-raised)', borderRadius: '8px', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--border-subtle)' }}>
      <Film size={32} style={{ opacity: 0.25, color: 'var(--text-secondary)' }} />
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Format not supported in preview</p>
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>Use "Open" to play in your default app</p>
    </div>
  );

  return (
    <div style={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <video ref={videoRef} src={src} poster={posterUrl ?? undefined}
        style={{ display: 'block', width: '100%', height: videoHeight !== null ? `${videoHeight}px` : undefined, aspectRatio: videoHeight === null ? '16/9' : undefined, objectFit: 'contain', background: '#000', cursor: 'pointer' }}
        onClick={togglePlay} onError={() => setLoadError(true)} preload="metadata" />

      <div style={{ background: 'var(--bg-surface)', padding: '10px 12px 8px', borderTop: '1px solid var(--border-subtle)', overflow: 'visible' }}>
        <div ref={trackRef}
          style={{ position: 'relative', height: `${CONTAINER_H}px`, marginBottom: '6px', overflow: 'visible', userSelect: 'none', cursor: 'default' }}
          onMouseDown={handleMouseDown}
        >
          {/* Track bar */}
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0, height: '4px', background: 'var(--border-default)', borderRadius: '2px' }}>
            {minPct !== null && <div style={{ position: 'absolute', height: '100%', background: 'var(--border-subtle)', borderRadius: '2px 0 0 2px', width: `${minPct}%` }} />}
            <div style={{ position: 'absolute', height: '100%', background: 'var(--color-accent)', borderRadius: '2px', width: `${pct}%`, transition: seeking ? 'none' : 'width 0.1s' }} />
          </div>

          {/* In-point line */}
          {minPct !== null && (
            <div style={{ position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)', left: `${minPct}%`, width: '2px', height: '16px', background: 'var(--color-accent)', opacity: 0.7 }} />
          )}

          {/* Marker dots */}
          {markers.map(marker => {
            const lp = durationMs > 0 ? (marker.position_ms / durationMs) * 100 : 0;
            const isRange = marker.end_position_ms && marker.end_position_ms > marker.position_ms;
            return (
              <div key={marker.id}>
                {isRange && <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', height: '8px', background: 'rgba(255,159,10,0.25)', borderRadius: '2px', left: `${lp}%`, width: `${((marker.end_position_ms! - marker.position_ms) / durationMs) * 100}%` }} />}
                <div style={{ position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)', left: `${lp}%`, zIndex: 10, cursor: 'pointer' }}
                  onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onMarkerClick?.(marker.position_ms); }} title={marker.name}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--status-orphaned)', border: '2px solid var(--bg-surface)' }} />
                </div>
              </div>
            );
          })}

          {/*
           * Playhead line — centred on track bar.
           * top: LINE_TOP (10px) — starts at triangle base
           * height: LINE_H (12px) — 6px above track centre + 6px below
           * Result: track bar bisects the line symmetrically.
           */}
          <div style={{
            position: 'absolute',
            top: `${LINE_TOP}px`,
            height: `${LINE_H}px`,
            left,
            transform: 'translateX(-50%)',
            width: '2px',
            background: 'var(--playhead-color)',
            zIndex: 20,
            pointerEvents: 'none',
          }} />

          {/* Triangle handle */}
          <div style={{ position: 'absolute', top: `${TRI_TOP}px`, left, transform: 'translateX(-50%)', zIndex: 30, cursor: 'ew-resize', lineHeight: 0 }}
            onMouseDown={e => { e.stopPropagation(); setSeeking(true); }}>
            <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `${TRI_H}px solid var(--playhead-color)` }} />
          </div>
        </div>

        {/* Play / timecode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={togglePlay}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {formatDuration(currentMs)} / {formatDuration(durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
