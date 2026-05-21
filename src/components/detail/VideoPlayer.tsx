// Video player with timeline, playback controls, and marker overlay.

import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import type { AssetMarker } from '../../types/asset';
import { formatDuration } from '../../utils/formatters';

interface VideoPlayerProps {
  filePath: string;
  durationMs: number;
  markers: AssetMarker[];
  minScrubMs?: number | null;
  onTimeUpdate?: (positionMs: number) => void;
  onMarkerClick?: (positionMs: number) => void;
}

export interface VideoPlayerHandle {
  seekTo: (ms: number) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({
  filePath,
  durationMs,
  markers,
  minScrubMs = null,
  onTimeUpdate,
  onMarkerClick,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const src = convertFileSrc(filePath);

  useImperativeHandle(ref, () => ({
    seekTo: (ms: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = minScrubMs !== null ? Math.max(ms, minScrubMs) : ms;
      video.currentTime = clamped / 1000;
      setCurrentMs(clamped);
    },
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handler = () => {
      let ms = Math.floor(video.currentTime * 1000);
      if (minScrubMs !== null && ms < minScrubMs) {
        video.currentTime = minScrubMs / 1000;
        ms = minScrubMs;
      }
      setCurrentMs(ms);
      onTimeUpdate?.(ms);
    };
    video.addEventListener('timeupdate', handler);
    return () => video.removeEventListener('timeupdate', handler);
  }, [minScrubMs, onTimeUpdate]);

  useEffect(() => {
    if (!seeking) return;
    function onMouseMove(e: MouseEvent) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seekToPosition(ratio * durationMs);
    }
    function onMouseUp() { setSeeking(false); }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [seeking, durationMs, minScrubMs]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  function seekToPosition(ms: number) {
    const video = videoRef.current;
    if (!video) return;
    const clamped = minScrubMs !== null ? Math.max(ms, minScrubMs) : ms;
    video.currentTime = clamped / 1000;
    setCurrentMs(clamped);
    onTimeUpdate?.(clamped);
  }

  function handleTimelineMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekToPosition(ratio * durationMs);
    setSeeking(true);
  }

  const progressPercent = durationMs > 0 ? (currentMs / durationMs) * 100 : 0;
  const minScrubPercent = minScrubMs !== null && durationMs > 0
    ? (minScrubMs / durationMs) * 100
    : null;

  if (loadError) {
    return (
      <div className="bg-gray-900 rounded-lg flex flex-col items-center justify-center py-10 gap-3">
        <span className="text-4xl opacity-30">🎬</span>
        <p className="text-sm text-gray-500">Format not supported in preview</p>
        <p className="text-xs text-gray-600">Use "Open" to play in your default app</p>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
        onError={() => setLoadError(true)}
        preload="metadata"
      />

      <div className="bg-gray-900 px-3 pt-4 pb-2 space-y-2">
        <div className="relative select-none" style={{ height: '32px', overflow: 'visible' }}>
          <div
            ref={timelineRef}
            className="absolute inset-x-0"
            style={{ top: '10px', height: '22px', cursor: 'ew-resize' }}
            onMouseDown={handleTimelineMouseDown}
          >
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-700 rounded-full">
              {minScrubPercent !== null && (
                <div
                  className="absolute h-full bg-gray-600/50 rounded-l-full"
                  style={{ width: `${minScrubPercent}%` }}
                />
              )}
              <div
                className="absolute h-full bg-blue-500 rounded-full"
                style={{ left: 0, width: `${progressPercent}%` }}
              />
            </div>

            {minScrubPercent !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-5 bg-blue-400"
                style={{ left: `${minScrubPercent}%` }}
              />
            )}

            {markers.map(marker => {
              const leftPct = durationMs > 0 ? (marker.position_ms / durationMs) * 100 : 0;
              const isRange = marker.end_position_ms && marker.end_position_ms > marker.position_ms;
              return (
                <div key={marker.id}>
                  {isRange && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 bg-orange-400/30 rounded"
                      style={{
                        left: `${leftPct}%`,
                        width: `${((marker.end_position_ms! - marker.position_ms) / durationMs) * 100}%`,
                      }}
                    />
                  )}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                    style={{ left: `${leftPct}%`, cursor: 'pointer' }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onMarkerClick?.(marker.position_ms); }}
                    title={marker.name}
                  >
                    {/* All markers use orange dot */}
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-900 bg-orange-400" />
                  </div>
                </div>
              );
            })}

            <div
              className="absolute top-0 bottom-0 -translate-x-1/2 w-px bg-white z-20 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div
            className="absolute -translate-x-1/2 z-30"
            style={{ left: `${progressPercent}%`, top: '0px', cursor: 'ew-resize' }}
            onMouseDown={(e) => { e.stopPropagation(); setSeeking(true); }}
          >
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '10px solid white',
            }} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="text-white hover:text-blue-400 transition-colors text-lg w-6 text-center"
          >
            {playing ? '⏸' : '▶'}
          </button>
          <span className="text-xs text-gray-400 font-mono">
            {formatDuration(currentMs)} / {formatDuration(durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
