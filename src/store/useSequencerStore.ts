import { create } from 'zustand';
import { Track, PianoRollNote, TrackViewMode } from '../types/sequencer';
import { INITIAL_TRACKS, applyDefaultPattern, makeSteps } from '../constants/tracks';
import { MIN_STEPS, MAX_STEPS, STEP_COUNT } from '../constants/defaults';

interface SelectionRange {
  trackId: string;
  fromStep: number;
  toStep: number;
}

interface ClipboardData {
  steps: { active: boolean; velocity: number; note: string }[];
  sourceInstrumentKey: string;
}

interface SequencerState {
  tracks: Track[];
  stepCount: number;
  selection: SelectionRange | null;
  clipboard: ClipboardData | null;

  toggleStep: (trackId: string, stepIndex: number) => void;
  setTracks: (tracks: Track[]) => void;
  setStepNote: (trackId: string, stepIndex: number, note: string) => void;
  addSteps: () => void;
  removeSteps: () => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  setSynthParam: (trackId: string, key: string, value: number | string) => void;
  selectStep: (trackId: string, stepIndex: number | null) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;
  setSampleUrl: (trackId: string, url: string) => void;
  toggleKeyboardVisible: (trackId: string) => void;

  // Piano roll
  setViewMode: (trackId: string, mode: TrackViewMode) => void;
  addPianoRollNote: (trackId: string, note: PianoRollNote) => void;
  removePianoRollNote: (trackId: string, id: string) => void;
  resizePianoRollNote: (trackId: string, id: string, durationSteps: number) => void;

  // Selection / clipboard
  setSelection: (sel: SelectionRange | null) => void;
  copySelection: () => void;
  cutSelection: () => void;
  pasteClipboard: (targetTrackId: string, targetStep: number) => void;
}

export const useSequencerStore = create<SequencerState>((set, get) => ({
  tracks: applyDefaultPattern(INITIAL_TRACKS),
  stepCount: STEP_COUNT,
  selection: null,
  clipboard: null,

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

  reorderTracks: (fromIndex, toIndex) =>
    set((state) => {
      const tracks = [...state.tracks];
      const [removed] = tracks.splice(fromIndex, 1);
      tracks.splice(toIndex, 0, removed);
      return { tracks };
    }),

  setSampleUrl: (trackId, url) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id !== trackId ? t : { ...t, sampleUrl: url }
      ),
    })),

  toggleKeyboardVisible: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id !== trackId ? t : { ...t, keyboardVisible: !t.keyboardVisible }
      ),
    })),

  // Piano roll
  setViewMode: (trackId, mode) =>
    set((state) => ({
      tracks: state.tracks.map((track) => {
        if (track.id !== trackId) return track;
        if (mode === 'pianoroll' && track.pianoRollNotes.length === 0) {
          // Convert active steps to piano roll notes
          const newNotes: PianoRollNote[] = track.steps
            .map((step, i) =>
              step.active
                ? {
                    id: `${trackId}-${i}-${Date.now()}-${Math.random()}`,
                    startStep: i,
                    durationSteps: 1,
                    note: step.note,
                    velocity: step.velocity,
                  }
                : null
            )
            .filter(Boolean) as PianoRollNote[];
          return { ...track, viewMode: mode, pianoRollNotes: newNotes };
        }
        if (mode === 'sequencer') {
          // Update steps based on piano roll notes (mark active where a note starts)
          const updatedSteps = track.steps.map((step, i) => ({
            ...step,
            active: track.pianoRollNotes.some((n) => n.startStep === i),
          }));
          return { ...track, viewMode: mode, steps: updatedSteps };
        }
        return { ...track, viewMode: mode };
      }),
    })),

  addPianoRollNote: (trackId, note) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id !== trackId
          ? track
          : { ...track, pianoRollNotes: [...track.pianoRollNotes, note] }
      ),
    })),

  removePianoRollNote: (trackId, id) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id !== trackId
          ? track
          : {
              ...track,
              pianoRollNotes: track.pianoRollNotes.filter((n) => n.id !== id),
            }
      ),
    })),

  resizePianoRollNote: (trackId, id, durationSteps) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id !== trackId
          ? track
          : {
              ...track,
              pianoRollNotes: track.pianoRollNotes.map((n) =>
                n.id !== id ? n : { ...n, durationSteps: Math.max(1, durationSteps) }
              ),
            }
      ),
    })),

  // Selection / clipboard
  setSelection: (sel) => set({ selection: sel }),

  copySelection: () => {
    const state = get();
    if (!state.selection) return;
    const { trackId, fromStep, toStep } = state.selection;
    const track = state.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const steps = track.steps.slice(fromStep, toStep + 1).map((s) => ({ ...s }));
    set({ clipboard: { steps, sourceInstrumentKey: track.instrumentKey } });
  },

  cutSelection: () => {
    const state = get();
    if (!state.selection) return;
    const { trackId, fromStep, toStep } = state.selection;
    const track = state.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const steps = track.steps.slice(fromStep, toStep + 1).map((s) => ({ ...s }));
    set((s) => ({
      clipboard: { steps, sourceInstrumentKey: track.instrumentKey },
      tracks: s.tracks.map((t) =>
        t.id !== trackId
          ? t
          : {
              ...t,
              steps: t.steps.map((step, i) =>
                i >= fromStep && i <= toStep ? { ...step, active: false } : step
              ),
            }
      ),
    }));
  },

  pasteClipboard: (targetTrackId, targetStep) =>
    set((state) => {
      if (!state.clipboard) return state;
      const { steps } = state.clipboard;
      return {
        tracks: state.tracks.map((t) =>
          t.id !== targetTrackId
            ? t
            : {
                ...t,
                steps: t.steps.map((step, i) => {
                  const clipIdx = i - targetStep;
                  if (clipIdx >= 0 && clipIdx < steps.length) {
                    return {
                      ...step,
                      active: steps[clipIdx].active,
                      note: steps[clipIdx].note,
                      velocity: steps[clipIdx].velocity,
                    };
                  }
                  return step;
                }),
              }
        ),
      };
    }),
}));

// Expose store to audio engine without importing React
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__dawSequencerStore = useSequencerStore;
