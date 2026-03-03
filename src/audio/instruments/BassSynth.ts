import * as Tone from 'tone';

export function createAcidBass(): Tone.MonoSynth {
  return new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: {
      Q: 6,
      type: 'lowpass',
      rolloff: -24,
    },
    envelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.2,
      release: 0.1,
    },
    filterEnvelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.1,
      release: 0.08,
      baseFrequency: 200,
      octaves: 4,
      exponent: 2,
    },
  });
}

export function createSubBass(): Tone.MonoSynth {
  return new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    filter: {
      Q: 1,
      type: 'lowpass',
      rolloff: -12,
    },
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.3,
      release: 0.2,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.1,
      baseFrequency: 80,
      octaves: 2,
      exponent: 1,
    },
  });
}

export function createReeseBass(): Tone.MonoSynth {
  return new Tone.MonoSynth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oscillator: { type: 'fatsawtooth', spread: 20, count: 2 } as any,
    filter: {
      Q: 4,
      type: 'lowpass',
      rolloff: -24,
    },
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.4,
      release: 0.2,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.2,
      release: 0.1,
      baseFrequency: 150,
      octaves: 3,
      exponent: 2,
    },
  });
}
