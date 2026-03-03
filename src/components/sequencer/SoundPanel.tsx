import React from 'react';
import { Track } from '../../types/sequencer';
import { SynthTypeName } from '../../types/audio';
import { soundLibrary } from '../../audio/soundLibrary';
import { audioEngine } from '../../audio/AudioEngine';
import { useSequencerStore } from '../../store/useSequencerStore';

interface ParamConfig {
  key: string;
  label: string;
  type: 'slider' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

const PARAM_CONFIGS: Record<SynthTypeName, ParamConfig[]> = {
  MembraneSynth: [
    { key: 'pitchDecay', label: 'Pitch Decay', type: 'slider', min: 0.01, max: 0.5, step: 0.01 },
    { key: 'octaves', label: 'Octaves', type: 'slider', min: 1, max: 12, step: 0.5 },
    { key: 'decay', label: 'Decay', type: 'slider', min: 0.05, max: 2, step: 0.01 },
    { key: 'release', label: 'Release', type: 'slider', min: 0.01, max: 1, step: 0.01 },
  ],
  NoiseSynth: [
    { key: 'noiseType', label: 'Noise', type: 'select', options: ['white', 'pink', 'brown'] },
    { key: 'attack', label: 'Attack', type: 'slider', min: 0.001, max: 0.5, step: 0.001 },
    { key: 'decay', label: 'Decay', type: 'slider', min: 0.05, max: 2, step: 0.01 },
  ],
  MetalSynth: [
    { key: 'harmonicity', label: 'Harmonic', type: 'slider', min: 0.5, max: 20, step: 0.1 },
    { key: 'modulationIndex', label: 'Mod Idx', type: 'slider', min: 1, max: 64, step: 1 },
    { key: 'resonance', label: 'Resonance', type: 'slider', min: 200, max: 8000, step: 50 },
    { key: 'decay', label: 'Decay', type: 'slider', min: 0.01, max: 1, step: 0.01 },
  ],
  MonoSynth: [
    { key: 'oscType', label: 'Osc', type: 'select', options: ['sawtooth', 'square', 'triangle', 'sine'] },
    { key: 'filterQ', label: 'Filter Q', type: 'slider', min: 0.5, max: 20, step: 0.5 },
    { key: 'filterDecay', label: 'Flt Decay', type: 'slider', min: 0.01, max: 2, step: 0.01 },
    { key: 'attack', label: 'Attack', type: 'slider', min: 0.001, max: 1, step: 0.001 },
    { key: 'decay', label: 'Decay', type: 'slider', min: 0.01, max: 2, step: 0.01 },
    { key: 'sustain', label: 'Sustain', type: 'slider', min: 0, max: 1, step: 0.01 },
  ],
  FMSynth: [
    { key: 'harmonicity', label: 'Harmonic', type: 'slider', min: 0.5, max: 20, step: 0.5 },
    { key: 'modulationIndex', label: 'Mod Idx', type: 'slider', min: 0, max: 50, step: 1 },
    { key: 'attack', label: 'Attack', type: 'slider', min: 0.001, max: 2, step: 0.001 },
    { key: 'decay', label: 'Decay', type: 'slider', min: 0.01, max: 2, step: 0.01 },
    { key: 'sustain', label: 'Sustain', type: 'slider', min: 0, max: 1, step: 0.01 },
    { key: 'release', label: 'Release', type: 'slider', min: 0.01, max: 4, step: 0.01 },
  ],
  AMSynth: [
    { key: 'harmonicity', label: 'Harmonic', type: 'slider', min: 0.5, max: 20, step: 0.5 },
    { key: 'attack', label: 'Attack', type: 'slider', min: 0.001, max: 2, step: 0.001 },
    { key: 'decay', label: 'Decay', type: 'slider', min: 0.01, max: 2, step: 0.01 },
    { key: 'sustain', label: 'Sustain', type: 'slider', min: 0, max: 1, step: 0.01 },
    { key: 'release', label: 'Release', type: 'slider', min: 0.01, max: 4, step: 0.01 },
  ],
};

interface Props {
  track: Track;
}

export function SoundPanel({ track }: Props) {
  const setSynthParam = useSequencerStore((s) => s.setSynthParam);
  const descriptor = soundLibrary[track.instrumentKey];
  if (!descriptor) return null;

  const synthType = descriptor.synthType;
  const configs = PARAM_CONFIGS[synthType] ?? [];

  function getValue(key: string): number | string {
    if (key in track.synthParams) return track.synthParams[key];
    return descriptor.defaultSynthParams[key] ?? 0;
  }

  function handleChange(key: string, value: number | string) {
    setSynthParam(track.id, key, value);
    audioEngine.setTrackParam(track.id, key, value);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        padding: '8px 16px 8px 140px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {configs.map((cfg) => (
        <div key={cfg.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 80 }}>
          <label style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {cfg.label}
          </label>
          {cfg.type === 'select' ? (
            <select
              value={getValue(cfg.key) as string}
              onChange={(e) => handleChange(cfg.key, e.target.value)}
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontSize: 10,
                padding: '2px 4px',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              {cfg.options!.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="range"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={getValue(cfg.key) as number}
                onChange={(e) => handleChange(cfg.key, parseFloat(e.target.value))}
                style={{ width: 72, accentColor: track.color, cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: 9, width: 32, textAlign: 'right' }}>
                {Number(getValue(cfg.key)).toFixed(
                  (cfg.step ?? 0.1) < 0.01 ? 3 : (cfg.step ?? 0.1) < 1 ? 2 : 1
                )}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
