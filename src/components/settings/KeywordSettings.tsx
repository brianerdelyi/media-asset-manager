// KeywordSettings — single keyword phrase and marker label for auto-marking.

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { keywordList, keywordSave, type Keyword } from '../../commands/automark';
import { showToast } from '../../stores/toastStore';

export function KeywordSettings() {
  const [phrase, setPhrase] = useState('mark video');
  const [label, setLabel] = useState('Auto-Mark');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordId, setKeywordId] = useState<string>(crypto.randomUUID());

  useEffect(() => {
    keywordList()
      .then(kws => {
        if (kws.length > 0) {
          setPhrase(kws[0].phrase);
          setLabel(kws[0].label);
          setKeywordId(kws[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!phrase.trim()) return;
    setSaving(true);
    try {
      const kw: Keyword = { id: keywordId, phrase: phrase.trim(), label: label.trim() || 'Auto-Mark' };
      await keywordSave([kw]);
      showToast('Keyword saved.', 'success');
    } catch (e) {
      showToast(`Failed to save: ${String(e)}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  const INPUT: React.CSSProperties = {
    background: 'var(--bg-raised)',
    border: '1px solid var(--border-default)',
    borderRadius: '6px',
    padding: '6px 8px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  if (loading) return <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>Loading…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Tip */}
      <div style={{
        display: 'flex', gap: '8px', alignItems: 'flex-start',
        background: 'var(--bg-raised)', borderRadius: '6px', padding: '10px 12px',
        border: '1px solid var(--border-subtle)',
      }}>
        <Info size={13} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Speak your keyword phrase during recording to mark that moment automatically.
          Use a short, distinctive phrase unlikely to appear in normal speech —
          the default <strong>"mark video"</strong> works well. After transcription,
          Auto-Marking scans the transcript and creates a point marker at each match.
        </p>
      </div>

      {/* Phrase */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
          Keyword Phrase
        </label>
        <input
          type="text" value={phrase}
          onChange={e => setPhrase(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
          placeholder="mark video"
          style={INPUT}
          onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
        />
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          Say this phrase during recording to create a marker at that timestamp.
        </p>
      </div>

      {/* Label */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
          Marker Label
        </label>
        <input
          type="text" value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
          placeholder="Auto-Mark"
          style={INPUT}
          onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
        />
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          Generated markers will be named "{label || 'Auto-Mark'} 1", "{label || 'Auto-Mark'} 2", etc.
        </p>
      </div>

      {/* Save */}
      <div>
        <button
          onClick={handleSave}
          disabled={!phrase.trim() || saving}
          style={{
            fontSize: '12px', padding: '6px 14px',
            background: phrase.trim() ? 'var(--color-accent)' : 'var(--bg-raised)',
            color: phrase.trim() ? '#fff' : 'var(--text-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            cursor: phrase.trim() && !saving ? 'pointer' : 'not-allowed',
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
