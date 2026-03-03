import React, { useState } from 'react';
import { Track } from '../../types/sequencer';
import { StepButton } from './StepButton';
import { SoundPanel } from './SoundPanel';
import { NoteKeyboard, isPitchedInstrument } from './NoteKeyboard';
import { useMixerStore } from '../../store/useMixerStore';
import { useSequencerStore } from '../../store/useSequencerStore';
import { audioEngine } from '../../audio/AudioEngine';

interface Props {
  track: Track;
}

const BTN: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 4,
  border: '1px solid var(--border-light)',
  background: 'var(--bg-3)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 9,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function TrackRow({ track }: Props) {
  const [showPanel, setShowPanel] = useState(false);
  const channel = useMixerStore((s) => s.channels[track.id]);
  const toggleMute = useMixerStore((s) => s.toggleMute);
  const removeChannel = useMixerStore((s) => s.removeChannel);
  const removeTrack = useSequencerStore((s) => s.removeTrack);
  const trackCount = useSequencerStore((s) => s.tracks.length);
  const pitched = isPitchedInstrument(track.instrumentKey);

  function handleRemove() {
    audioEngine.removeTrack(track.id);
    removeTrack(track.id);
    removeChannel(track.id);
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Main row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '5px 0',
      }}>
        {/* Track label */}
        <div style={{
          width: 'var(--track-label-w)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 8px 0 16px',
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
            fontSize: 10,
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
              ...BTN,
              background: channel?.muted ? '#e05252' : 'var(--bg-3)',
            }}
            title={channel?.muted ? 'Unmute' : 'Mute'}
          >
            M
          </button>
          {/* Sound panel toggle */}
          <button
            onClick={() => setShowPanel((v) => !v)}
            style={{
              ...BTN,
              background: showPanel ? 'var(--accent)' : 'var(--bg-3)',
              color: showPanel ? '#fff' : 'var(--text-secondary)',
              fontSize: 11,
            }}
            title="Sound Design"
          >
            ⚙
          </button>
          {/* Remove button */}
          <button
            onClick={handleRemove}
            disabled={trackCount <= 1}
            style={{
              ...BTN,
              background: 'var(--bg-3)',
              color: trackCount <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: trackCount <= 1 ? 'not-allowed' : 'pointer',
              opacity: trackCount <= 1 ? 0.4 : 1,
            }}
            title="Remove Track"
          >
            ×
          </button>
        </div>

        {/* Step grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--step-gap)', position: 'relative' }}>
          {track.steps.map((_, i) => (
            <StepButton
              key={i}
              trackId={track.id}
              trackColor={track.color}
              stepIndex={i}
              groupStart={i % 4 === 0}
              isPitched={pitched}
            />
          ))}
        </div>
      </div>

      {/* Sound design panel */}
      {showPanel && <SoundPanel track={track} />}

      {/* Note keyboard (pitched instruments, when a step is selected) */}
      {pitched && track.selectedStep !== null && (
        <NoteKeyboard
          trackId={track.id}
          instrumentKey={track.instrumentKey}
          selectedStep={track.selectedStep}
          trackColor={track.color}
        />
      )}
    </div>
  );
}
