import { create } from 'zustand';
import { Track } from '../types/sequencer';
import { INITIAL_TRACKS, applyDefaultPattern } from '../constants/tracks';

interface SequencerState {
  tracks: Track[];
  toggleStep: (trackId: string, stepIndex: number) => void;
  setTracks: (tracks: Track[]) => void;
  setStepNote: (trackId: string, stepIndex: number, note: string) => void;
}

export const useSequencerStore = create<SequencerState>((set) => ({
  tracks: applyDefaultPattern(INITIAL_TRACKS),

  toggleStep: (trackId, stepIndex) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id !== trackId
          ? track
          : {
              ...track,
              steps: track.steps.map((step, i) =>
                i !== stepIndex ? step : { ...step, active: !step.active }
              ),
            }
      ),
    })),

  setTracks: (tracks) => set({ tracks }),

  setStepNote: (trackId, stepIndex, note) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id !== trackId
          ? track
          : {
              ...track,
              steps: track.steps.map((step, i) =>
                i !== stepIndex ? step : { ...step, note }
              ),
            }
      ),
    })),
}));

// Expose store to audio engine without importing React
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__dawSequencerStore = useSequencerStore;
