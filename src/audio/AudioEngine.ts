import * as Tone from 'tone';
import { Track } from '../types/sequencer';
import { TrackInstrument } from './TrackInstrument';
import { masterBus } from './effects/MasterBus';

let setCurrentStep: ((step: number) => void) | null = null;

export function registerStepCallback(cb: (step: number) => void): void {
  setCurrentStep = cb;
}

interface SamplePlayer {
  player: Tone.Player;
  volume: Tone.Volume;
}

class AudioEngine {
  private instruments: Map<string, TrackInstrument> = new Map();
  private samplePlayers: Map<string, SamplePlayer> = new Map();
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
          if (track.trackType === 'sample') {
            // Sample track: look up player, trigger if step is active
            const sp = this.samplePlayers.get(track.id);
            if (!sp) return;
            const step = track.steps[stepIndex as number];
            if (!step?.active) return;
            try {
              sp.player.start(time);
            } catch {
              // Player may not be loaded yet
            }
            return;
          }

          const inst = this.instruments.get(track.id);
          if (!inst) return;

          if (track.viewMode === 'pianoroll') {
            // Piano roll path: trigger notes that start at this step
            const stepIdx = stepIndex as number;
            track.pianoRollNotes
              .filter((n) => n.startStep === stepIdx)
              .forEach((n) => {
                const durSeconds = Tone.Time('16n').toSeconds() * n.durationSteps;
                inst.triggerWithDuration(n.note, durSeconds, time, n.velocity);
              });
          } else {
            // Step sequencer path
            const step = track.steps[stepIndex as number];
            if (!step?.active) return;
            inst.trigger(step.note, time, step.velocity);
          }
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

    this.samplePlayers.forEach((sp) => {
      sp.player.stop();
      sp.player.dispose();
      sp.volume.dispose();
    });
    this.samplePlayers.clear();

    if (this.sequence) {
      this.sequence.dispose();
      this.sequence = null;
    }

    this.tracks = tracks;
    this.currentStepCount = stepCount;

    tracks.forEach((track) => {
      if (track.trackType === 'sample') {
        if (track.sampleUrl) this.addSampleTrack(track.id, track.sampleUrl);
      } else {
        this.instruments.set(track.id, new TrackInstrument(track.instrumentKey));
      }
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
    const sp = this.samplePlayers.get(trackId);
    if (sp) {
      sp.volume.volume.value = db;
      return;
    }
    this.instruments.get(trackId)?.setVolume(db);
  }

  updateTracks(tracks: Track[]): void {
    this.tracks = tracks;
  }

  setStepCount(n: number): void {
    this.currentStepCount = n;
    if (!this.sequence) return;

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
    if (track.trackType === 'sample') {
      if (track.sampleUrl) this.addSampleTrack(track.id, track.sampleUrl);
      return;
    }
    this.instruments.set(track.id, new TrackInstrument(track.instrumentKey));
  }

  removeTrack(trackId: string): void {
    const sp = this.samplePlayers.get(trackId);
    if (sp) {
      this.removeSampleTrack(trackId);
      return;
    }
    const inst = this.instruments.get(trackId);
    if (inst) {
      inst.dispose();
      this.instruments.delete(trackId);
    }
  }

  setTrackParam(trackId: string, key: string, value: number | string): void {
    const sp = this.samplePlayers.get(trackId);
    if (sp) {
      if (key === 'playbackRate') sp.player.playbackRate = value as number;
      return;
    }
    this.instruments.get(trackId)?.setParam(key, value);
  }

  previewNote(trackId: string, note: string): void {
    this.instruments.get(trackId)?.triggerPreview(note);
  }

  addSampleTrack(trackId: string, url: string): void {
    const volume = new Tone.Volume(0);
    const player = new Tone.Player({
      url,
      autostart: false,
    });
    player.connect(volume);
    (volume as Tone.ToneAudioNode).connect(masterBus as Tone.ToneAudioNode);
    this.samplePlayers.set(trackId, { player, volume });
  }

  removeSampleTrack(trackId: string): void {
    const sp = this.samplePlayers.get(trackId);
    if (!sp) return;
    try { sp.player.stop(); } catch { /* may not be started */ }
    sp.player.dispose();
    sp.volume.dispose();
    this.samplePlayers.delete(trackId);
  }

  isReady(): boolean {
    return this.initialized;
  }
}

export const audioEngine = new AudioEngine();
