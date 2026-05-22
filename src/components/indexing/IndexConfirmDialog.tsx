import { useState } from 'react';
import { Button } from '../common/Button';
import { Dialog, DialogTitle, DialogDescription, DialogActions } from '../common/Dialog';

interface IndexConfirmDialogProps {
  driveName: string;
  defaultGenerateThumbnails: boolean;
  defaultMediaTypes?: string[];
  onConfirm: (generateThumbnails: boolean, mediaTypes: string[]) => void;
  onCancel: () => void;
}

export function IndexConfirmDialog({
  driveName,
  defaultGenerateThumbnails,
  defaultMediaTypes,
  onConfirm,
  onCancel,
}: IndexConfirmDialogProps) {
  const [generateThumbnails, setGenerateThumbnails] = useState(defaultGenerateThumbnails);
  const [mediaTypes, setMediaTypes] = useState<string[]>(
    defaultMediaTypes ?? ['video', 'image', 'audio']
  );

  function toggleType(type: string) {
    setMediaTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }

  const mediaTypeOptions = [
    { value: 'video', label: 'Video', desc: 'MP4, MOV, MXF, AVI…' },
    { value: 'image', label: 'Image', desc: 'JPG, PNG, TIFF, HEIC…' },
    { value: 'audio', label: 'Audio', desc: 'WAV, MP3, AIFF, FLAC…' },
  ];

  return (
    <Dialog>
      <DialogTitle>Index Drive</DialogTitle>
      <DialogDescription>
        Scan media files on{' '}
        <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{driveName}</strong>
      </DialogDescription>

      {/* Media type selection */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{
          fontSize: '11px', color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          margin: '0 0 8px',
        }}>
          Media Types
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {mediaTypeOptions.map(opt => (
            <label
              key={opt.value}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', padding: '8px 10px',
                background: mediaTypes.includes(opt.value)
                  ? 'var(--color-accent-subtle)'
                  : 'var(--bg-raised)',
                border: `1px solid ${mediaTypes.includes(opt.value) ? 'var(--color-accent)' : 'var(--border-subtle)'}`,
                borderRadius: '6px', transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={mediaTypes.includes(opt.value)}
                onChange={() => toggleType(opt.value)}
                style={{ accentColor: 'var(--color-accent)', flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                  {opt.label}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  {opt.desc}
                </p>
              </div>
            </label>
          ))}
        </div>
        {mediaTypes.length === 0 && (
          <p style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '6px' }}>
            Select at least one media type
          </p>
        )}
      </div>

      {/* Thumbnail toggle */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        cursor: 'pointer', padding: '10px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
      }}>
        <input
          type="checkbox"
          checked={generateThumbnails}
          onChange={e => setGenerateThumbnails(e.target.checked)}
          style={{ accentColor: 'var(--color-accent)', marginTop: '1px', flexShrink: 0 }}
        />
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px' }}>
            Generate thumbnails
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
            Creates preview images for video and photo assets
          </p>
        </div>
      </label>

      <DialogActions>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          variant="primary"
          onClick={() => onConfirm(generateThumbnails, mediaTypes)}
          disabled={mediaTypes.length === 0}
        >
          Start Indexing
        </Button>
      </DialogActions>
    </Dialog>
  );
}
