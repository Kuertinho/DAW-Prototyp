export type InstrumentCategory = 'drums' | 'bass' | 'synth';

export interface InstrumentDescriptor {
  key: string;
  name: string;
  category: InstrumentCategory;
  defaultNote: string;
}
