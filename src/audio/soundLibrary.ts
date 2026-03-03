import { InstrumentDescriptor } from '../types/audio';

export const soundLibrary: Record<string, InstrumentDescriptor> = {
  'kick-808': {
    key: 'kick-808',
    name: 'Kick 808',
    category: 'drums',
    defaultNote: 'C1',
  },
  'kick-punchy': {
    key: 'kick-punchy',
    name: 'Kick Punchy',
    category: 'drums',
    defaultNote: 'C1',
  },
  clap: {
    key: 'clap',
    name: 'Clap',
    category: 'drums',
    defaultNote: 'C4',
  },
  'hihat-closed': {
    key: 'hihat-closed',
    name: 'Hi-Hat Closed',
    category: 'drums',
    defaultNote: 'C5',
  },
  'hihat-open': {
    key: 'hihat-open',
    name: 'Hi-Hat Open',
    category: 'drums',
    defaultNote: 'C5',
  },
  'bass-acid': {
    key: 'bass-acid',
    name: 'Acid Bass',
    category: 'bass',
    defaultNote: 'C2',
  },
  'lead-fm': {
    key: 'lead-fm',
    name: 'FM Lead',
    category: 'synth',
    defaultNote: 'C4',
  },
};
