import * as Tone from 'tone';

export function createClap(): Tone.NoiseSynth {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0,
      release: 0.05,
    },
  });
}
