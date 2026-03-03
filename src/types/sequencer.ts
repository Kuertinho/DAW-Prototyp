export interface Step {
  active: boolean;
  velocity: number; // 0–1
  note: string;     // e.g. "C2"
}

export interface Track {
  id: string;
  name: string;
  instrumentKey: string;
  steps: Step[];
  color: string;
  synthParams: Record<string, number | string>;
  selectedStep: number | null;
}

export interface Pattern {
  tracks: Track[];
  bpm: number;
}
