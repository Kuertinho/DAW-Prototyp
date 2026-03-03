import * as Tone from 'tone';
import { Track } from '../types/sequencer';
import { TrackInstrument } from './TrackInstrument';

let setCurrentStep: ((step: number) => void) | null = null;

export function registerStepCallback(cb: (step: number) => void): void {
  setCurrentStep = cb;
}

class AudioEngine {
  private instruments: Map<string, TrackInstrument> = new Map();
  private sequence: Tone.Sequence | null = null;
  private tracks: Track[] = [];
  private initialized = false;
  private currentStepCount = 16;

  async init(): Promise<void> {
    if (this.initialized) return;
    await Tone.start();
    Tone.getTransport().bpm.value = 138;
    this.initialized = true;
  }

  private buildSequence(count: number): Tone.Sequence {
    const stepIndices = Array.from({ length: count }, (_, i) => i);
    const seq = new Tone.Sequence(
      (time, stepIndex) => {
        const { tracks: liveTracks } = (
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
    seq.loop = true;
    return seq;
  }

  loadTracks(tracks: Track[], stepCount = 16): void {
    this.instruments.forEach((inst) => inst.dispose());
    this.instruments.clear();

    if (this.sequence) {
      this.sequence.dispose();
      this.sequence = null;
    }

    this.tracks = tracks;
    this.currentStepCount = stepCount;

    tracks.forEach((track) => {
      this.instruments.set(track.id, new TrackInstrument(track.instrumentKey));
    });

    this.sequence = this.buildSequence(stepCount);
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

  setStepCount(n: number): void {
    this.currentStepCount = n;
    if (!this.sequence) return; // not yet loaded

    const wasPlaying = Tone.getTransport().state === 'started';

    if (wasPlaying) {
      Tone.getTransport().stop();
      this.sequence.stop();
    }

    this.sequence.dispose();
    this.sequence = this.buildSequence(n);

    if (wasPlaying) {
      this.sequence.start(0);
      Tone.getTransport().start();
    }
  }

  addTrack(track: Track): void {
    this.instruments.set(track.id, new TrackInstrument(track.instrumentKey));
  }

  removeTrack(trackId: string): void {
    const inst = this.instruments.get(trackId);
    if (inst) {
      inst.dispose();
      this.instruments.delete(trackId);
    }
  }

  setTrackParam(trackId: string, key: string, value: number | string): void {
    this.instruments.get(trackId)?.setParam(key, value);
  }

  isReady(): boolean {
    return this.initialized;
  }
}

export const audioEngine = new AudioEngine();
