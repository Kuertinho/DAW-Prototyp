import * as Tone from 'tone';

export function createHiHatClosed(): Tone.MetalSynth {
  const synth = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.08,
      release: 0.01,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  });
  synth.frequency.value = 400;
  return synth;
}

export function createHiHatOpen(): Tone.MetalSynth {
  const synth = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.35,
      release: 0.1,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  });
  synth.frequency.value = 400;
  return synth;
}
