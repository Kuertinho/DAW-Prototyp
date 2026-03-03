import React, { useCallback } from 'react';
import { useMixerStore } from '../../store/useMixerStore';
import { Track } from '../../types/sequencer';

interface Props {
  track: Track;
}

export function ChannelStrip({ track }: Props) {
  const channel = useMixerStore((s) => s.channels[track.id]);
  const setVolume = useMixerStore((s) => s.setVolume);
  const toggleMute = useMixerStore((s) => s.toggleMute);
  const toggleSolo = useMixerStore((s) => s.toggleSolo);

  const onFaderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(track.id, Number(e.target.value));
    },
    [track.id, setVolume]
  );

  if (!channel) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      padding: '10px 8px',
      borderRight: '1px solid var(--border)',
      width: 64,
      flexShrink: 0,
    }}>
      {/* Color indicator */}
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: track.color,
        flexShrink: 0,
      }} />

      {/* Vertical fader */}
      <input
        type="range"
        min={0}
        max={100}
        value={channel.volume}
        onChange={onFaderChange}
        style={{
          writingMode: 'vertical-lr' as const,
          direction: 'rtl' as const,
          height: 80,
          cursor: 'pointer',
          accentColor: track.color,
        }}
        title={`${track.name} volume: ${channel.volume}%`}
      />

      {/* Volume value */}
      <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>{channel.volume}</span>

      {/* Mute */}
      <button
        onClick={() => toggleMute(track.id)}
        style={{
          width: 28,
          height: 20,
          borderRadius: 3,
          border: '1px solid var(--border-light)',
          background: channel.muted ? '#e05252' : 'var(--bg-3)',
          color: channel.muted ? '#fff' : 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 9,
          fontWeight: 700,
        }}
      >
        M
      </button>

      {/* Solo */}
      <button
        onClick={() => toggleSolo(track.id)}
        style={{
          width: 28,
          height: 20,
          borderRadius: 3,
          border: '1px solid var(--border-light)',
          background: channel.soloed ? '#e0c452' : 'var(--bg-3)',
          color: channel.soloed ? '#000' : 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 9,
          fontWeight: 700,
        }}
      >
        S
      </button>

      {/* Track name */}
      <span style={{
        color: 'var(--text-muted)',
        fontSize: 9,
        textAlign: 'center',
        overflow: 'hidden',
        maxWidth: 52,
        lineHeight: 1.2,
      }}>
        {track.name}
      </span>
    </div>
  );
}
