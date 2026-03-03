import React, { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { TransportBar } from './components/transport/TransportBar';
import { Sequencer } from './components/sequencer/Sequencer';
import { MixerPanel } from './components/mixer/MixerPanel';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useSequencerSync } from './hooks/useSequencerSync';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Import store so globalThis.__dawSequencerStore is registered
import './store/useSequencerStore';

function DAW() {
  useSequencerSync();
  useKeyboardShortcuts();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-0)',
      overflow: 'hidden',
    }}>
      <TopBar />
      <TransportBar />
      <Sequencer />
      <MixerPanel />
    </div>
  );
}

export default function App() {
  const [audioReady, setAudioReady] = useState(false);
  const { init } = useAudioEngine();

  const handleEnable = async () => {
    await init();
    setAudioReady(true);
  };

  if (!audioReady) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-0)',
        gap: 20,
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 20px var(--accent-glow)',
        }} />
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
        }}>
          DAW Prototyp
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Browser audio requires a user interaction to start
        </p>
        <button
          onClick={handleEnable}
          style={{
            padding: '12px 32px',
            borderRadius: 8,
            border: '1px solid var(--accent)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px var(--accent-glow)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Enable Audio
        </button>
      </div>
    );
  }

  return <DAW />;
}
