import React from 'react';
import { useSequencerStore } from '../../store/useSequencerStore';
import { TrackRow } from './TrackRow';
import { PlayheadIndicator } from './PlayheadIndicator';
import { AddTrackButton } from './AddTrackButton';
import { MIN_STEPS, MAX_STEPS } from '../../constants/defaults';

const STEP_SIZE = 40;
const STEP_GAP = 3;
const GROUP_EXTRA = 6;
const TRACK_LABEL_W = 140;

function calcGridWidth(stepCount: number): number {
  const numGroupMarkers = Math.floor(stepCount / 4) - 1;
  return stepCount * (STEP_SIZE + STEP_GAP) + numGroupMarkers * GROUP_EXTRA - STEP_GAP;
}

export function Sequencer() {
  const tracks = useSequencerStore((s) => s.tracks);
  const stepCount = useSequencerStore((s) => s.stepCount);
  const addSteps = useSequencerStore((s) => s.addSteps);
  const removeSteps = useSequencerStore((s) => s.removeSteps);

  const gridW = calcGridWidth(stepCount);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      overflowX: 'auto',
      background: 'var(--bg-0)',
    }}>
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

        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} />
        ))}

        <AddTrackButton />
      </div>
    </div>
  );
}
