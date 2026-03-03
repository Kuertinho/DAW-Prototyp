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
