export interface Step {
  active: boolean;
  velocity: number; // 0–1
  note: string;     // e.g. "C2"
}

export interface PianoRollNote {
  id: string;
  startStep: number;
  durationSteps: number; // min 1
  note: string;          // "C4"
  velocity: number;      // 0–1
}

export type TrackViewMode = 'sequencer' | 'pianoroll';

export interface Track {
  id: string;
  name: string;
  instrumentKey: string;
  steps: Step[];
  color: string;
  synthParams: Record<string, number | string>;
  selectedStep: number | null;
  viewMode: TrackViewMode;
  pianoRollNotes: PianoRollNote[];
  keyboardVisible: boolean;
  trackType: 'synth' | 'sample';
  sampleUrl: string | null;
}

export interface Pattern {
  tracks: Track[];
  bpm: number;
}
