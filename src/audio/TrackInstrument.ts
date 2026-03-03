import * as Tone from 'tone';
import { masterBus } from './effects/MasterBus';
import { createKick808, createKickPunchy, createKickSub, createKickSnap } from './instruments/KickSynth';
import { createClap, createSnare } from './instruments/ClapSynth';
import { createHiHatClosed, createHiHatOpen } from './instruments/HiHatSynth';
import { createAcidBass, createSubBass, createReeseBass } from './instruments/BassSynth';
import { createFMLead, createAMLead, createPluckLead } from './instruments/LeadSynth';
import {
  createCowbell,
  createRimshot,
  createShaker,
  createTom,
  createTechStab,
  createTechPad,
  createWobbleBass,
} from './instruments/TechHouseInstruments';
import { SynthTypeName } from '../types/audio';

type AnyInstrument =
  | Tone.MembraneSynth
  | Tone.NoiseSynth
  | Tone.MetalSynth
  | Tone.MonoSynth
  | Tone.FMSynth
  | Tone.AMSynth;

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
      case 'kick-808':      return createKick808();
      case 'kick-punchy':   return createKickPunchy();
      case 'kick-sub':      return createKickSub();
      case 'kick-snap':     return createKickSnap();
      case 'clap':          return createClap();
      case 'snare':         return createSnare();
      case 'hihat-closed':  return createHiHatClosed();
      case 'hihat-open':    return createHiHatOpen();
      case 'bass-acid':     return createAcidBass();
      case 'bass-sub':      return createSubBass();
      case 'bass-reese':    return createReeseBass();
      case 'lead-fm':       return createFMLead();
      case 'lead-am':       return createAMLead();
      case 'lead-pluck':    return createPluckLead();
      case 'cowbell':       return createCowbell();
      case 'rimshot':       return createRimshot();
      case 'shaker':        return createShaker();
      case 'tom':           return createTom();
      case 'tech-stab':     return createTechStab();
      case 'tech-pad':      return createTechPad();
      case 'wobble-bass':   return createWobbleBass();
      default:              return createKick808();
    }
  }

  private buildFX(key: string): TrackFX {
    const volume = new Tone.Volume(0);

    if (key === 'clap' || key === 'snare' || key === 'rimshot') {
      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.35 });
      return { reverb, volume };
    }

    if (
      key === 'lead-fm' || key === 'lead-am' || key === 'lead-pluck' ||
      key === 'tech-stab' || key === 'tech-pad'
    ) {
      const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.35, wet: 0.3 });
      return { delay, volume };
    }

    return { volume };
  }

  /** Normalized trigger — works for all synth types */
  trigger(note: string, time: number, velocity: number = 1): void {
    const dur = '16n';
    if (
      this.synth instanceof Tone.NoiseSynth ||
      this.synth instanceof Tone.MetalSynth
    ) {
      (this.synth as Tone.NoiseSynth).triggerAttackRelease(dur, time, velocity);
    } else {
      (this.synth as Tone.MembraneSynth).triggerAttackRelease(note, dur, time, velocity);
    }
  }

  /** Trigger with explicit duration in seconds (for piano roll notes) */
  triggerWithDuration(note: string, durSeconds: number, time: number, velocity: number = 1): void {
    if (
      this.synth instanceof Tone.NoiseSynth ||
      this.synth instanceof Tone.MetalSynth
    ) {
      (this.synth as Tone.NoiseSynth).triggerAttackRelease(durSeconds, time, velocity);
    } else {
      (this.synth as Tone.MembraneSynth).triggerAttackRelease(note, durSeconds, time, velocity);
    }
  }

  /** Immediate preview trigger (for keyboard clicks) */
  triggerPreview(note: string): void {
    const now = Tone.now();
    if (
      this.synth instanceof Tone.NoiseSynth ||
      this.synth instanceof Tone.MetalSynth
    ) {
      (this.synth as Tone.NoiseSynth).triggerAttackRelease('8n', now);
    } else {
      (this.synth as Tone.MembraneSynth).triggerAttackRelease(note, '8n', now);
    }
  }

  setVolume(db: number): void {
    this.fx.volume.volume.value = db;
  }

  getSynthType(): SynthTypeName {
    if (this.synth instanceof Tone.MembraneSynth) return 'MembraneSynth';
    if (this.synth instanceof Tone.NoiseSynth) return 'NoiseSynth';
    if (this.synth instanceof Tone.MetalSynth) return 'MetalSynth';
    if (this.synth instanceof Tone.MonoSynth) return 'MonoSynth';
    if (this.synth instanceof Tone.AMSynth) return 'AMSynth';
    if (this.synth instanceof Tone.FMSynth) return 'FMSynth';
    return 'MembraneSynth';
  }

  setParam(key: string, value: number | string): void {
    const s = this.synth;
    try {
      if (s instanceof Tone.MembraneSynth) {
        if (key === 'pitchDecay') s.pitchDecay = value as number;
        else if (key === 'octaves') s.octaves = value as number;
        else if (key === 'decay') s.envelope.decay = value as number;
        else if (key === 'release') s.envelope.release = value as number;
      } else if (s instanceof Tone.NoiseSynth) {
        if (key === 'noiseType') s.noise.type = value as Tone.NoiseType;
        else if (key === 'attack') s.envelope.attack = value as number;
        else if (key === 'decay') s.envelope.decay = value as number;
      } else if (s instanceof Tone.MetalSynth) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (key === 'harmonicity') (s.harmonicity as any).value = value as number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (key === 'modulationIndex') (s.modulationIndex as any).value = value as number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (key === 'resonance') (s.resonance as any).value = value as number;
        else if (key === 'decay') s.envelope.decay = value as number;
      } else if (s instanceof Tone.MonoSynth) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (key === 'oscType') (s.oscillator as any).type = value as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (key === 'filterQ') (s.filter.Q as any).value = value as number;
        else if (key === 'filterDecay') s.filterEnvelope.decay = value as number;
        else if (key === 'attack') s.envelope.attack = value as number;
        else if (key === 'decay') s.envelope.decay = value as number;
        else if (key === 'sustain') s.envelope.sustain = value as number;
      } else if (s instanceof Tone.AMSynth) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (key === 'harmonicity') (s.harmonicity as any).value = value as number;
        else if (key === 'attack') s.envelope.attack = value as number;
        else if (key === 'decay') s.envelope.decay = value as number;
        else if (key === 'sustain') s.envelope.sustain = value as number;
        else if (key === 'release') s.envelope.release = value as number;
      } else if (s instanceof Tone.FMSynth) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (key === 'harmonicity') (s.harmonicity as any).value = value as number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (key === 'modulationIndex') (s.modulationIndex as any).value = value as number;
        else if (key === 'attack') s.envelope.attack = value as number;
        else if (key === 'decay') s.envelope.decay = value as number;
        else if (key === 'sustain') s.envelope.sustain = value as number;
        else if (key === 'release') s.envelope.release = value as number;
      }
    } catch (e) {
      console.warn('setParam error:', key, value, e);
    }
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
