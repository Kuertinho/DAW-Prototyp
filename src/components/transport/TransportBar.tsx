import React from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { useTransportStore } from '../../store/useTransportStore';
import { BpmKnob } from './BpmKnob';

export function TransportBar() {
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const setPlaying = useTransportStore((s) => s.setPlaying);

  const toggle = () => {
    if (isPlaying) {
      audioEngine.stop();
      setPlaying(false);
    } else {
      audioEngine.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{
      height: 'var(--transport-h)',
      background: 'var(--bg-1)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 20,
      flexShrink: 0,
    }}>
      {/* Play / Stop */}
      <button
        onClick={toggle}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: '1px solid var(--border-light)',
          background: isPlaying ? 'var(--accent)' : 'var(--bg-3)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPlaying ? '0 0 12px var(--accent-glow)' : 'none',
          transition: 'all 0.1s ease',
        }}
        title="Play / Stop (Space)"
      >
        {isPlaying ? '■' : '▶'}
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 32, background: 'var(--border)' }} />

      <BpmKnob />

      <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.08em' }}>
        SPACE = PLAY/STOP
      </div>
    </div>
  );
}
