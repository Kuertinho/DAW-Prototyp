import * as Tone from 'tone';
import { masterBus } from './effects/MasterBus';
import { createKick808, createKickPunchy } from './instruments/KickSynth';
import { createClap } from './instruments/ClapSynth';
import { createHiHatClosed, createHiHatOpen } from './instruments/HiHatSynth';
import { createAcidBass } from './instruments/BassSynth';
import { createFMLead } from './instruments/LeadSynth';

type AnyInstrument =
  | Tone.MembraneSynth
  | Tone.NoiseSynth
  | Tone.MetalSynth
  | Tone.MonoSynth
  | Tone.FMSynth;

// Per-track effects chain
interface TrackFX {
  reverb?: Tone.Reverb;
  delay?: Tone.FeedbackDelay;
  volume: Tone.Volume;
}

export class TrackInstrument {
  private synth: AnyInstrument;
  private fx: TrackFX;
  private instrumentKey: string;

  constructor(instrumentKey: string) {
    this.instrumentKey = instrumentKey;
    this.synth = this.createSynth(instrumentKey);

    this.fx = this.buildFX(instrumentKey);

    // Connect: synth → fx chain → masterBus
    const firstNode = this.fx.reverb ?? this.fx.delay ?? this.fx.volume;
    (this.synth as Tone.ToneAudioNode).connect(firstNode as Tone.ToneAudioNode);

    if (this.fx.reverb && this.fx.delay) {
      this.fx.reverb.connect(this.fx.delay as Tone.ToneAudioNode);
      this.fx.delay.connect(this.fx.volume as Tone.ToneAudioNode);
    } else if (this.fx.reverb) {
      this.fx.reverb.connect(this.fx.volume as Tone.ToneAudioNode);
    } else if (this.fx.delay) {
      this.fx.delay.connect(this.fx.volume as Tone.ToneAudioNode);
    }

    (this.fx.volume as Tone.ToneAudioNode).connect(masterBus as Tone.ToneAudioNode);
  }

  private createSynth(key: string): AnyInstrument {
    switch (key) {
      case 'kick-808':     return createKick808();
      case 'kick-punchy':  return createKickPunchy();
      case 'clap':         return createClap();
      case 'hihat-closed': return createHiHatClosed();
      case 'hihat-open':   return createHiHatOpen();
      case 'bass-acid':    return createAcidBass();
      case 'lead-fm':      return createFMLead();
      default:             return createKick808();
    }
  }

  private buildFX(key: string): TrackFX {
    const volume = new Tone.Volume(0);

    if (key === 'clap') {
      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.35 });
      return { reverb, volume };
    }

    if (key === 'lead-fm') {
      const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.35, wet: 0.3 });
      return { delay, volume };
    }

    return { volume };
  }

  /** Normalized trigger — works for all synth types */
  trigger(note: string, time: number, velocity: number = 1): void {
    const dur = '16n';
    const vel = velocity;

    if (
      this.synth instanceof Tone.NoiseSynth ||
      this.synth instanceof Tone.MetalSynth
    ) {
      // These don't take a note argument
      (this.synth as Tone.NoiseSynth).triggerAttackRelease(dur, time, vel);
    } else {
      (this.synth as Tone.MembraneSynth).triggerAttackRelease(note, dur, time, vel);
    }
  }

  setVolume(db: number): void {
    this.fx.volume.volume.value = db;
  }

  dispose(): void {
    this.synth.dispose();
    this.fx.volume.dispose();
    this.fx.reverb?.dispose();
    this.fx.delay?.dispose();
  }

  getKey(): string {
    return this.instrumentKey;
  }
}
