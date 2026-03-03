import { useCallback, useRef } from 'react';
import { audioEngine, registerStepCallback } from '../audio/AudioEngine';
import { useSequencerStore } from '../store/useSequencerStore';
import { useTransportStore } from '../store/useTransportStore';

export function useAudioEngine() {
  const initialized = useRef(false);

  const init = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    // Register the step callback before init so it's ready
    const { setCurrentStep } = useTransportStore.getState();
    registerStepCallback(setCurrentStep);

    await audioEngine.init();

    // Load tracks into engine
    const { tracks } = useSequencerStore.getState();
    audioEngine.loadTracks(tracks);
  }, []);

  return { init };
}
