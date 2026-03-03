export type InstrumentCategory = 'drums' | 'bass' | 'synth';

export type SynthTypeName =
  | 'MembraneSynth'
  | 'NoiseSynth'
  | 'MetalSynth'
  | 'MonoSynth'
  | 'FMSynth'
  | 'AMSynth';

export interface InstrumentDescriptor {
  key: string;
  name: string;
  category: InstrumentCategory;
  defaultNote: string;
  synthType: SynthTypeName;
  defaultSynthParams: Record<string, number | string>;
}
