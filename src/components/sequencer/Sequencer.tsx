import React, { useRef } from 'react';
import { useSequencerStore } from '../../store/useSequencerStore';
import { useMixerStore } from '../../store/useMixerStore';
import { TrackRow } from './TrackRow';
import { PlayheadIndicator } from './PlayheadIndicator';
import { AddTrackButton } from './AddTrackButton';
import { MIN_STEPS, MAX_STEPS } from '../../constants/defaults';
import { makeSteps } from '../../constants/tracks';
import { Track } from '../../types/sequencer';
import { audioEngine } from '../../audio/AudioEngine';

const STEP_SIZE = 40;
const STEP_GAP = 3;
const GROUP_EXTRA = 6;
const TRACK_LABEL_W = 140;

const TRACK_COLORS = [
  '#e05252', '#e07a52', '#e0c452', '#52e07a', '#52c4e0',
  '#5274e0', '#a052e0', '#e052a0', '#52e0c4', '#e0b252',
];

function calcGridWidth(stepCount: number): number {
  const numGroupMarkers = Math.floor(stepCount / 4) - 1;
  return stepCount * (STEP_SIZE + STEP_GAP) + numGroupMarkers * GROUP_EXTRA - STEP_GAP;
}

export function Sequencer() {
  const tracks = useSequencerStore((s) => s.tracks);
  const stepCount = useSequencerStore((s) => s.stepCount);
  const addSteps = useSequencerStore((s) => s.addSteps);
  const removeSteps = useSequencerStore((s) => s.removeSteps);
  const addTrack = useSequencerStore((s) => s.addTrack);
  const addChannel = useMixerStore((s) => s.addChannel);
  const dragCounter = useRef(0);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const gridW = calcGridWidth(stepCount);

  function handleDragOver(e: React.DragEvent) {
    // Only handle if dragging an audio file (not track reorder)
    if (Array.from(e.dataTransfer.items).some((item) => item.kind === 'file')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    dragCounter.current++;
    if (Array.from(e.dataTransfer.items).some((item) => item.kind === 'file')) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave() {
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    dragCounter.current = 0;
    setIsDragOver(false);

    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('audio/'));
    if (!file) return;

    e.preventDefault();
    const url = URL.createObjectURL(file);
    const colorIdx = tracks.length % TRACK_COLORS.length;
    const filename = file.name.replace(/\.[^/.]+$/, '');

    const newTrack: Track = {
      id: `track-sample-${Date.now()}`,
      name: filename,
      instrumentKey: 'sample',
      steps: makeSteps('C4', stepCount),
      color: TRACK_COLORS[colorIdx],
      synthParams: { playbackRate: 1 },
      selectedStep: null,
      viewMode: 'sequencer',
      pianoRollNotes: [],
      keyboardVisible: false,
      trackType: 'sample',
      sampleUrl: url,
    };

    addTrack(newTrack);
    addChannel(newTrack.id);
    audioEngine.addSampleTrack(newTrack.id, url);
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'auto',
        background: isDragOver ? 'rgba(124, 92, 224, 0.05)' : 'var(--bg-0)',
        transition: 'background 0.15s ease',
        outline: isDragOver ? '2px dashed var(--accent)' : 'none',
        outlineOffset: -2,
      }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Step number header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-1)',
        zIndex: 2,
      }}>
        <div style={{ width: TRACK_LABEL_W, flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 'var(--step-gap)', alignItems: 'center', flex: 1 }}>
          {Array.from({ length: stepCount }, (_, i) => (
            <div
              key={i}
              style={{
                width: STEP_SIZE,
                textAlign: 'center',
                color: i % 4 === 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontSize: 10,
                fontWeight: i % 4 === 0 ? 600 : 400,
                flexShrink: 0,
                marginLeft: i % 4 === 0 && i !== 0 ? GROUP_EXTRA : 0,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Step count controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 12px',
          flexShrink: 0,
        }}>
          <button
            onClick={removeSteps}
            disabled={stepCount <= MIN_STEPS}
            style={{
              width: 26,
              height: 22,
              borderRadius: 4,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-3)',
              color: stepCount <= MIN_STEPS ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: stepCount <= MIN_STEPS ? 'not-allowed' : 'pointer',
              fontSize: 11,
              opacity: stepCount <= MIN_STEPS ? 0.4 : 1,
            }}
            title="Remove 4 steps"
          >
            −4
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: 10, minWidth: 24, textAlign: 'center' }}>
            {stepCount}
          </span>
          <button
            onClick={addSteps}
            disabled={stepCount >= MAX_STEPS}
            style={{
              width: 26,
              height: 22,
              borderRadius: 4,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-3)',
              color: stepCount >= MAX_STEPS ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: stepCount >= MAX_STEPS ? 'not-allowed' : 'pointer',
              fontSize: 11,
              opacity: stepCount >= MAX_STEPS ? 0.4 : 1,
            }}
            title="Add 4 steps"
          >
            +4
          </button>
        </div>
      </div>

      {/* Track rows + playhead overlay */}
      <div style={{ position: 'relative' }}>
        {/* Playhead positioned relative to step grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: TRACK_LABEL_W + 10,
          width: gridW,
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          <PlayheadIndicator />
        </div>

        {tracks.map((track, index) => (
          <TrackRow key={track.id} track={track} trackIndex={index} />
        ))}

        <AddTrackButton />
      </div>
    </div>
  );
}
