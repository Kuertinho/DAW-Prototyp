import * as Tone from 'tone';

export function createCowbell(): Tone.MetalSynth {
  return new Tone.MetalSynth({
    harmonicity: 5.6,
    modulationIndex: 16,
    resonance: 5600,
    octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
  });
}

export function createRimshot(): Tone.NoiseSynth {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
  });
}

export function createShaker(): Tone.NoiseSynth {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
  });
}

export function createTom(): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
  });
}

export function createTechStab(): Tone.FMSynth {
  return new Tone.FMSynth({
    harmonicity: 6,
    modulationIndex: 20,
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    modulation: { type: 'square' },
    modulationEnvelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
  });
}

export function createTechPad(): Tone.AMSynth {
  return new Tone.AMSynth({
    harmonicity: 2,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.4, decay: 0.3, sustain: 0.8, release: 2.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 },
  });
}

export function createWobbleBass(): Tone.MonoSynth {
  return new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 12, type: 'lowpass', rolloff: -24 },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 0.1 },
    filterEnvelope: {
      attack: 0.002,
      decay: 0.2,
      sustain: 0.2,
      release: 0.1,
      baseFrequency: 80,
      octaves: 4,
      exponent: 2,
    },
  });
}
