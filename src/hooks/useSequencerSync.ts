import { useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useSequencerStore } from '../store/useSequencerStore';
import { useTransportStore } from '../store/useTransportStore';
import { useMixerStore } from '../store/useMixerStore';

/**
 * Single React↔audio bridge.
 * Watches Zustand stores and imperatively calls audioEngine.
 * Must be mounted once near the app root.
 */
export function useSequencerSync() {
  const bpm = useTransportStore((s) => s.bpm);
  const channels = useMixerStore((s) => s.channels);
  const tracks = useSequencerStore((s) => s.tracks);
  const stepCount = useSequencerStore((s) => s.stepCount);

  // Sync BPM
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  // Sync per-track volume + mute/solo
  useEffect(() => {
    const hasSolo = Object.values(channels).some((c) => c.soloed);

    Object.entries(channels).forEach(([trackId, ch]) => {
      const silenced = ch.muted || (hasSolo && !ch.soloed);
      const db = silenced ? -Infinity : (ch.volume / 100) * 0 + (1 - ch.volume / 100) * -40;
      audioEngine.setTrackVolume(trackId, db);
    });
  }, [channels]);

  // Keep engine's track reference updated (steps are read live in callback)
  useEffect(() => {
    audioEngine.updateTracks(tracks);
  }, [tracks]);

  // Sync step count
  useEffect(() => {
    audioEngine.setStepCount(stepCount);
  }, [stepCount]);
}
