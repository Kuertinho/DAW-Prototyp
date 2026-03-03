import React, { useState } from 'react';
import { Track } from '../../types/sequencer';
import { StepButton } from './StepButton';
import { SoundPanel } from './SoundPanel';
import { NoteKeyboard, isPitchedInstrument } from './NoteKeyboard';
import { PianoRoll } from './PianoRoll';
import { useMixerStore } from '../../store/useMixerStore';
import { useSequencerStore } from '../../store/useSequencerStore';
import { audioEngine } from '../../audio/AudioEngine';

interface Props {
  track: Track;
  trackIndex: number;
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

export function TrackRow({ track, trackIndex }: Props) {
  const [showPanel, setShowPanel] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const channel = useMixerStore((s) => s.channels[track.id]);
  const toggleMute = useMixerStore((s) => s.toggleMute);
  const removeChannel = useMixerStore((s) => s.removeChannel);
  const removeTrack = useSequencerStore((s) => s.removeTrack);
  const trackCount = useSequencerStore((s) => s.tracks.length);
  const toggleKeyboardVisible = useSequencerStore((s) => s.toggleKeyboardVisible);
  const setViewMode = useSequencerStore((s) => s.setViewMode);
  const reorderTracks = useSequencerStore((s) => s.reorderTracks);
  const setStepNote = useSequencerStore((s) => s.setStepNote);
  const pitched = isPitchedInstrument(track.instrumentKey);

  function handleRemove() {
    audioEngine.removeTrack(track.id);
    removeTrack(track.id);
    removeChannel(track.id);
  }

  function handleKeyClick(note: string) {
    audioEngine.previewNote(track.id, note);
    if (track.selectedStep !== null) {
      setStepNote(track.id, track.selectedStep, note);
    }
  }

  // Drag-and-drop reorder handlers
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', String(trackIndex));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== trackIndex) {
      reorderTracks(fromIndex, trackIndex);
    }
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDragEnd() {
    setIsDragOver(false);
  }

  const currentNote =
    track.selectedStep !== null
      ? track.steps[track.selectedStep]?.note
      : undefined;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
      style={{
        borderBottom: '1px solid var(--border)',
        borderTop: isDragOver ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
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
          padding: '0 8px 0 4px',
        }}>
          {/* Drag handle */}
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: 11,
              cursor: 'grab',
              flexShrink: 0,
              userSelect: 'none',
              padding: '0 2px',
            }}
            title="Drag to reorder"
          >
            ≡
          </span>

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

          {/* Piano roll toggle (pitched synth tracks only) */}
          {pitched && track.trackType === 'synth' && (
            <button
              onClick={() =>
                setViewMode(
                  track.id,
                  track.viewMode === 'pianoroll' ? 'sequencer' : 'pianoroll'
                )
              }
              style={{
                ...BTN,
                background: track.viewMode === 'pianoroll' ? '#a052e0' : 'var(--bg-3)',
                color: track.viewMode === 'pianoroll' ? '#fff' : 'var(--text-secondary)',
                fontSize: 10,
              }}
              title={track.viewMode === 'pianoroll' ? 'Switch to Sequencer' : 'Switch to Piano Roll'}
            >
              ♪
            </button>
          )}

          {/* Keyboard toggle */}
          <button
            onClick={() => toggleKeyboardVisible(track.id)}
            style={{
              ...BTN,
              background: track.keyboardVisible ? 'var(--accent)' : 'var(--bg-3)',
              color: track.keyboardVisible ? '#fff' : 'var(--text-secondary)',
              fontSize: 11,
            }}
            title="Toggle Note Keyboard"
          >
            ♫
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

        {/* Step grid or piano roll */}
        {track.viewMode === 'pianoroll' && track.trackType === 'synth' ? (
          <PianoRoll track={track} />
        ) : (
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
        )}
      </div>

      {/* Sound design panel */}
      {showPanel && <SoundPanel track={track} />}

      {/* Note keyboard (always-visible when toggled, or when a step is selected on pitched tracks) */}
      {(track.keyboardVisible || (pitched && track.selectedStep !== null)) && (
        <NoteKeyboard
          trackId={track.id}
          instrumentKey={track.instrumentKey}
          trackColor={track.color}
          onKeyClick={handleKeyClick}
          currentNote={currentNote}
        />
      )}
    </div>
  );
}
