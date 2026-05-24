// Utility functions for formatting values in the UI.

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDuration(ms: number | null): string {
  if (!ms) return '--';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatDate(timestamp: number | null): string {
  if (!timestamp) return '--';
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatResolution(width: number | null, height: number | null): string {
  if (!width || !height) return '--';
  return `${width}×${height}`;
}

export function mediaTypeLabel(type: string): string {
  switch (type) {
    case 'video': return 'Video';
    case 'image': return 'Image';
    case 'audio': return 'Audio';
    default: return type;
  }
}

export function mediaTypeIcon(type: string): string {
  switch (type) {
    case 'video': return '🎬';
    case 'image': return '🖼️';
    case 'audio': return '🎵';
    default: return '📄';
  }
}
