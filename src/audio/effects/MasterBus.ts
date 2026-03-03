import * as Tone from 'tone';

// Compressor → Limiter → Destination
const compressor = new Tone.Compressor({
  threshold: -12,
  ratio: 4,
  attack: 0.003,
  release: 0.25,
  knee: 6,
});

const limiter = new Tone.Limiter(-1);

compressor.connect(limiter);
limiter.toDestination();

export const masterBus: Tone.InputNode = compressor;
