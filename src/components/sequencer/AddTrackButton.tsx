import React, { useState } from 'react';
import { soundLibrary } from '../../audio/soundLibrary';
import { useSequencerStore } from '../../store/useSequencerStore';
import { useMixerStore } from '../../store/useMixerStore';
import { audioEngine } from '../../audio/AudioEngine';
import { makeSteps } from '../../constants/tracks';
import { Track } from '../../types/sequencer';
import { InstrumentCategory } from '../../types/audio';

const TRACK_COLORS = [
  '#e05252', '#e07a52', '#e0c452', '#52e07a', '#52c4e0',
  '#5274e0', '#a052e0', '#e052a0', '#52e0c4', '#e0b252',
  '#c4e052', '#e05274',
];

const CATEGORIES: InstrumentCategory[] = ['drums', 'bass', 'synth'];
const CATEGORY_LABELS: Record<InstrumentCategory, string> = {
  drums: 'Drums',
  bass: 'Bass',
  synth: 'Synth',
};

export function AddTrackButton() {
  const [open, setOpen] = useState(false);
  const tracks = useSequencerStore((s) => s.tracks);
  const stepCount = useSequencerStore((s) => s.stepCount);
  const addTrack = useSequencerStore((s) => s.addTrack);
  const addChannel = useMixerStore((s) => s.addChannel);

  function handleSelect(instrumentKey: string) {
    const descriptor = soundLibrary[instrumentKey];
    if (!descriptor) return;

    const colorIdx = tracks.length % TRACK_COLORS.length;
    const newTrack: Track = {
      id: `track-${instrumentKey}-${Date.now()}`,
      name: descriptor.name,
      instrumentKey,
      steps: makeSteps(descriptor.defaultNote, stepCount),
      color: TRACK_COLORS[colorIdx],
      synthParams: { ...descriptor.defaultSynthParams },
      selectedStep: null,
    };

    addTrack(newTrack);
    addChannel(newTrack.id);
    audioEngine.addTrack(newTrack);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative', padding: '8px 16px' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px dashed var(--border-light)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: 11,
          cursor: 'pointer',
          letterSpacing: '0.08em',
          transition: 'all 0.1s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-light)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
        }}
      >
        + Add Track
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: '100%',
            zIndex: 10,
            background: 'var(--bg-2)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            padding: '8px 0',
            minWidth: 180,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {CATEGORIES.map((cat) => {
            const entries = Object.values(soundLibrary).filter((d) => d.category === cat);
            return (
              <div key={cat}>
                <div
                  style={{
                    padding: '4px 12px',
                    color: 'var(--text-muted)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    borderTop: cat !== 'drums' ? '1px solid var(--border)' : 'none',
                    marginTop: cat !== 'drums' ? 4 : 0,
                    paddingTop: cat !== 'drums' ? 8 : 4,
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </div>
                {entries.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => handleSelect(d.key)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '6px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: 11,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-3)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                    }}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
