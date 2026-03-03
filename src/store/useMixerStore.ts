import { create } from 'zustand';
import { INITIAL_TRACKS } from '../constants/tracks';

interface ChannelState {
  volume: number; // 0–100 (maps to dB)
  muted: boolean;
  soloed: boolean;
}

interface MixerState {
  channels: Record<string, ChannelState>;
  setVolume: (trackId: string, volume: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
}

const initialChannels: Record<string, ChannelState> = {};
INITIAL_TRACKS.forEach((t) => {
  initialChannels[t.id] = { volume: 80, muted: false, soloed: false };
});

export const useMixerStore = create<MixerState>((set) => ({
  channels: initialChannels,

  setVolume: (trackId, volume) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [trackId]: { ...state.channels[trackId], volume },
      },
    })),

  toggleMute: (trackId) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [trackId]: {
          ...state.channels[trackId],
          muted: !state.channels[trackId].muted,
        },
      },
    })),

  toggleSolo: (trackId) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [trackId]: {
          ...state.channels[trackId],
          soloed: !state.channels[trackId].soloed,
        },
      },
    })),
}));
