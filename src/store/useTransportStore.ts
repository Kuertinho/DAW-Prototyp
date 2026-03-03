import { create } from 'zustand';
import { DEFAULT_BPM } from '../constants/defaults';

interface TransportState {
  isPlaying: boolean;
  bpm: number;
  currentStep: number; // -1 = stopped
  setPlaying: (playing: boolean) => void;
  setBpm: (bpm: number) => void;
  setCurrentStep: (step: number) => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  isPlaying: false,
  bpm: DEFAULT_BPM,
  currentStep: -1,

  setPlaying: (playing) => set({ isPlaying: playing }),
  setBpm: (bpm) => set({ bpm }),
  setCurrentStep: (step) => set({ currentStep: step }),
}));
