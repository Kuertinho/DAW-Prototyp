import { useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useTransportStore } from '../store/useTransportStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        const { isPlaying, setPlaying } = useTransportStore.getState();
        if (isPlaying) {
          audioEngine.stop();
          setPlaying(false);
        } else {
          audioEngine.play();
          setPlaying(true);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
