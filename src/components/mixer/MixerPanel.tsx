import React from 'react';
import { useSequencerStore } from '../../store/useSequencerStore';
import { ChannelStrip } from './ChannelStrip';

export function MixerPanel() {
  const tracks = useSequencerStore((s) => s.tracks);

  return (
    <div style={{
      background: 'var(--bg-1)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Panel header */}
      <div style={{
        padding: '6px 16px',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Mixer
      </div>

      {/* Channel strips */}
      <div style={{ display: 'flex', overflowX: 'auto' }}>
        {tracks.map((track) => (
          <ChannelStrip key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}
