import { useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useTransportStore } from '../store/useTransportStore';
import { useSequencerStore } from '../store/useSequencerStore';

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
        return;
      }

      // Ctrl/Cmd shortcuts
      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        useSequencerStore.getState().copySelection();
        return;
      }

      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        useSequencerStore.getState().cutSelection();
        return;
      }

      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        const { selection, clipboard, pasteClipboard } = useSequencerStore.getState();
        if (!clipboard) return;
        if (selection) {
          pasteClipboard(selection.trackId, selection.toStep + 1);
        } else {
          // If no selection, paste at step 0 of first track with clipboard's source
          const { tracks } = useSequencerStore.getState();
          if (tracks.length > 0) {
            pasteClipboard(tracks[0].id, 0);
          }
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
