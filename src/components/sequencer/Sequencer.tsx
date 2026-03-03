import React from 'react';
import { useSequencerStore } from '../../store/useSequencerStore';
import { TrackRow } from './TrackRow';
import { PlayheadIndicator } from './PlayheadIndicator';
import { STEP_COUNT } from '../../constants/defaults';

const STEP_SIZE = 40;
const STEP_GAP = 3;
const GROUP_EXTRA = 6;
const TRACK_LABEL_W = 140;

// Total width of the step grid
const GRID_W =
  STEP_COUNT * (STEP_SIZE + STEP_GAP) +
  3 * GROUP_EXTRA - // 3 group markers (steps 4, 8, 12)
  STEP_GAP; // no trailing gap

export function Sequencer() {
  const tracks = useSequencerStore((s) => s.tracks);

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
        <div style={{ display: 'flex', gap: 'var(--step-gap)', alignItems: 'center' }}>
          {Array.from({ length: STEP_COUNT }, (_, i) => (
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
      </div>

      {/* Track rows + playhead overlay */}
      <div style={{ position: 'relative' }}>
        {/* Playhead positioned relative to step grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: TRACK_LABEL_W + 10 + (0 * (STEP_SIZE + STEP_GAP)), // offset matches step grid start
          width: GRID_W,
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          <PlayheadIndicator />
        </div>

        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}
