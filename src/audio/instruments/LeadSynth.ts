import * as Tone from 'tone';

export function createFMLead(): Tone.FMSynth {
  return new Tone.FMSynth({
    harmonicity: 3,
    modulationIndex: 10,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.3,
      release: 0.5,
    },
    modulation: { type: 'square' },
    modulationEnvelope: {
      attack: 0.002,
      decay: 0.2,
      sustain: 0.2,
      release: 0.3,
    },
  });
}
