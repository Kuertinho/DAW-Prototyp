import React from 'react';
import { Track } from '../../types/sequencer';
import { StepButton } from './StepButton';
import { STEP_COUNT } from '../../constants/defaults';
import { useMixerStore } from '../../store/useMixerStore';

interface Props {
  track: Track;
}

export function TrackRow({ track }: Props) {
  const channel = useMixerStore((s) => s.channels[track.id]);
  const toggleMute = useMixerStore((s) => s.toggleMute);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '5px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Track label */}
      <div style={{
        width: 'var(--track-label-w)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px 0 16px',
      }}>
        {/* Color dot */}
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: track.color,
          flexShrink: 0,
        }} />
        <span style={{
          color: channel?.muted ? 'var(--text-muted)' : 'var(--text-secondary)',
          fontSize: 11,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {track.name}
        </span>
        {/* Mute button */}
        <button
          onClick={() => toggleMute(track.id)}
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            border: '1px solid var(--border-light)',
            background: channel?.muted ? '#e05252' : 'var(--bg-3)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 9,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={channel?.muted ? 'Unmute' : 'Mute'}
        >
          M
        </button>
      </div>

      {/* Step grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--step-gap)', position: 'relative' }}>
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <StepButton
            key={i}
            trackId={track.id}
            trackColor={track.color}
            stepIndex={i}
            groupStart={i % 4 === 0}
          />
        ))}
      </div>
    </div>
  );
}
