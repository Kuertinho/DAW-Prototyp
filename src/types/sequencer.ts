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
}

export interface Pattern {
  tracks: Track[];
  bpm: number;
}
