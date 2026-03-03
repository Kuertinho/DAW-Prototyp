import { create } from 'zustand';
import { Track } from '../types/sequencer';
import { INITIAL_TRACKS, applyDefaultPattern, makeSteps } from '../constants/tracks';
import { MIN_STEPS, MAX_STEPS, STEP_COUNT } from '../constants/defaults';

interface SequencerState {
  tracks: Track[];
  stepCount: number;
  toggleStep: (trackId: string, stepIndex: number) => void;
  setTracks: (tracks: Track[]) => void;
  setStepNote: (trackId: string, stepIndex: number, note: string) => void;
  addSteps: () => void;
  removeSteps: () => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  setSynthParam: (trackId: string, key: string, value: number | string) => void;
  selectStep: (trackId: string, stepIndex: number | null) => void;
}

export const useSequencerStore = create<SequencerState>((set) => ({
  tracks: applyDefaultPattern(INITIAL_TRACKS),
  stepCount: STEP_COUNT,

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

  addSteps: () =>
    set((state) => {
      const newCount = Math.min(MAX_STEPS, state.stepCount + 4);
      if (newCount === state.stepCount) return state;
      const extra = newCount - state.stepCount;
      return {
        stepCount: newCount,
        tracks: state.tracks.map((track) => ({
          ...track,
          steps: [
            ...track.steps,
            ...makeSteps(track.steps[0]?.note ?? 'C4', extra),
          ],
        })),
      };
    }),

  removeSteps: () =>
    set((state) => {
      const newCount = Math.max(MIN_STEPS, state.stepCount - 4);
      if (newCount === state.stepCount) return state;
      return {
        stepCount: newCount,
        tracks: state.tracks.map((track) => ({
          ...track,
          steps: track.steps.slice(0, newCount),
          selectedStep:
            track.selectedStep !== null && track.selectedStep >= newCount
              ? null
              : track.selectedStep,
        })),
      };
    }),

  addTrack: (track) =>
    set((state) => ({
      tracks: [...state.tracks, track],
    })),

  removeTrack: (trackId) =>
    set((state) => {
      if (state.tracks.length <= 1) return state;
      return { tracks: state.tracks.filter((t) => t.id !== trackId) };
    }),

  setSynthParam: (trackId, key, value) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id !== trackId
          ? track
          : {
              ...track,
              synthParams: { ...track.synthParams, [key]: value },
            }
      ),
    })),

  selectStep: (trackId, stepIndex) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id !== trackId
          ? track
          : { ...track, selectedStep: stepIndex }
      ),
    })),
}));

// Expose store to audio engine without importing React
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__dawSequencerStore = useSequencerStore;
