import * as Tone from 'tone';
import { Track } from '../types/sequencer';
import { TrackInstrument } from './TrackInstrument';

// Lazy import to avoid circular dependency at module init time
// useTransportStore is imported dynamically inside the callback
let setCurrentStep: ((step: number) => void) | null = null;

export function registerStepCallback(cb: (step: number) => void): void {
  setCurrentStep = cb;
}

class AudioEngine {
  private instruments: Map<string, TrackInstrument> = new Map();
  private sequence: Tone.Sequence | null = null;
  private tracks: Track[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await Tone.start();
    Tone.getTransport().bpm.value = 138;
    this.initialized = true;
  }

  loadTracks(tracks: Track[]): void {
    // Dispose old instruments
    this.instruments.forEach((inst) => inst.dispose());
    this.instruments.clear();

    if (this.sequence) {
      this.sequence.dispose();
      this.sequence = null;
    }

    this.tracks = tracks;

    // Create one instrument per track
    tracks.forEach((track) => {
      this.instruments.set(track.id, new TrackInstrument(track.instrumentKey));
    });

    // Single Sequence for all tracks
    const stepIndices = Array.from({ length: 16 }, (_, i) => i);

    this.sequence = new Tone.Sequence(
      (time, stepIndex) => {
        // Read live state directly — avoids stale closure
        const { tracks: liveTracks } = (
          // Dynamic import of store state (no React import)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (globalThis as any).__dawSequencerStore?.getState() ?? { tracks: this.tracks }
        ) as { tracks: Track[] };

        liveTracks.forEach((track) => {
          const step = track.steps[stepIndex as number];
          if (!step?.active) return;

          const inst = this.instruments.get(track.id);
          if (!inst) return;

          inst.trigger(step.note, time, step.velocity);
        });

        // Defer UI update to animation frame so it aligns with audio
        if (setCurrentStep) {
          const cb = setCurrentStep;
          Tone.getDraw().schedule(() => {
            cb(stepIndex as number);
          }, time);
        }
      },
      stepIndices,
      '16n'
    );

    this.sequence.loop = true;
  }

  play(): void {
    if (!this.sequence) return;
    this.sequence.start(0);
    Tone.getTransport().start();
  }

  stop(): void {
    Tone.getTransport().stop();
    if (this.sequence) this.sequence.stop();
    if (setCurrentStep) setCurrentStep(-1);
  }

  setBpm(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  setTrackVolume(trackId: string, db: number): void {
    this.instruments.get(trackId)?.setVolume(db);
  }

  updateTracks(tracks: Track[]): void {
    this.tracks = tracks;
  }

  isReady(): boolean {
    return this.initialized;
  }
}

export const audioEngine = new AudioEngine();
