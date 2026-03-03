import { Track, Step } from '../types/sequencer';
import { STEP_COUNT } from './defaults';

function makeSteps(defaultNote: string): Step[] {
  return Array.from({ length: STEP_COUNT }, () => ({
    active: false,
    velocity: 1,
    note: defaultNote,
  }));
}

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-kick-808',
    name: 'Kick 808',
    instrumentKey: 'kick-808',
    steps: makeSteps('C1'),
    color: '#e05252',
  },
  {
    id: 'track-kick-punchy',
    name: 'Kick Punchy',
    instrumentKey: 'kick-punchy',
    steps: makeSteps('C1'),
    color: '#e07a52',
  },
  {
    id: 'track-clap',
    name: 'Clap',
    instrumentKey: 'clap',
    steps: makeSteps('C4'),
    color: '#e0c452',
  },
  {
    id: 'track-hihat-closed',
    name: 'Hi-Hat Closed',
    instrumentKey: 'hihat-closed',
    steps: makeSteps('C5'),
    color: '#52e07a',
  },
  {
    id: 'track-hihat-open',
    name: 'Hi-Hat Open',
    instrumentKey: 'hihat-open',
    steps: makeSteps('C5'),
    color: '#52c4e0',
  },
  {
    id: 'track-bass',
    name: 'Acid Bass',
    instrumentKey: 'bass-acid',
    steps: makeSteps('C2'),
    color: '#5274e0',
  },
  {
    id: 'track-lead',
    name: 'FM Lead',
    instrumentKey: 'lead-fm',
    steps: makeSteps('C4'),
    color: '#a052e0',
  },
];

// Pre-programmed classic techno pattern
export function applyDefaultPattern(tracks: Track[]): Track[] {
  return tracks.map((track) => {
    const steps = [...track.steps.map((s) => ({ ...s }))];

    if (track.instrumentKey === 'kick-808') {
      // Four-on-the-floor: steps 0, 4, 8, 12
      [0, 4, 8, 12].forEach((i) => { steps[i].active = true; });
    } else if (track.instrumentKey === 'hihat-closed') {
      // Every even step (8th notes)
      [0, 2, 4, 6, 8, 10, 12, 14].forEach((i) => { steps[i].active = true; });
    } else if (track.instrumentKey === 'clap') {
      // Clap on 2 and 4 (steps 4, 12)
      [4, 12].forEach((i) => { steps[i].active = true; });
    } else if (track.instrumentKey === 'hihat-open') {
      // Open hi-hat on offbeats: 2, 6, 10, 14
      [2, 10].forEach((i) => { steps[i].active = true; });
    }

    return { ...track, steps };
  });
}
