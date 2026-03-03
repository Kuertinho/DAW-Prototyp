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

export function createKickSub(): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.12,
    octaves: 10,
    envelope: {
      attack: 0.001,
      decay: 0.8,
      sustain: 0,
      release: 0.2,
    },
  });
}

export function createKickSnap(): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 3,
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0,
      release: 0.04,
    },
  });
}
