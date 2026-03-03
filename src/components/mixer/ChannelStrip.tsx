import React, { useCallback } from 'react';
import { useMixerStore } from '../../store/useMixerStore';
import { Track } from '../../types/sequencer';
import { VerticalSlider } from './VerticalSlider';

interface Props {
  track: Track;
}

const BTN_STYLE: React.CSSProperties = {
  width: 28,
  height: 20,
  borderRadius: 3,
  border: '1px solid var(--border-light)',
  cursor: 'pointer',
  fontSize: 9,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  WebkitAppearance: 'none',
  appearance: 'none',
};

export function ChannelStrip({ track }: Props) {
  const channel = useMixerStore((s) => s.channels[track.id]);
  const setVolume = useMixerStore((s) => s.setVolume);
  const toggleMute = useMixerStore((s) => s.toggleMute);
  const toggleSolo = useMixerStore((s) => s.toggleSolo);

  const onFaderChange = useCallback(
    (value: number) => {
      setVolume(track.id, value);
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
      <VerticalSlider
        min={0}
        max={100}
        value={channel.volume}
        onChange={onFaderChange}
        height={80}
        accentColor={track.color}
        title={`${track.name} volume: ${channel.volume}%`}
      />

      {/* Volume value */}
      <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>{channel.volume}</span>

      {/* Mute */}
      <button
        onClick={() => toggleMute(track.id)}
        style={{
          ...BTN_STYLE,
          background: channel.muted ? '#e05252' : 'var(--bg-3)',
          color: channel.muted ? '#fff' : 'var(--text-muted)',
        }}
      >
        M
      </button>

      {/* Solo */}
      <button
        onClick={() => toggleSolo(track.id)}
        style={{
          ...BTN_STYLE,
          background: channel.soloed ? '#e0c452' : 'var(--bg-3)',
          color: channel.soloed ? '#000' : 'var(--text-muted)',
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
