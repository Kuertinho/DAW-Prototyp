import * as Tone from 'tone';

export function createKick808(): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 8,
    envelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0,
      release: 0.1,
    },
  });
}

export function createKickPunchy(): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 5,
    envelope: {
      attack: 0.001,
      decay: 0.25,
      sustain: 0,
      release: 0.05,
    },
  });
}
