import React, { useCallback, useRef } from 'react';
import { useTransportStore } from '../../store/useTransportStore';
import { audioEngine } from '../../audio/AudioEngine';
import { MIN_BPM, MAX_BPM } from '../../constants/defaults';

export function BpmKnob() {
  const bpm = useTransportStore((s) => s.bpm);
  const setBpm = useTransportStore((s) => s.setBpm);

  const dragStart = useRef<{ y: number; bpm: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { y: e.clientY, bpm };
  }, [bpm]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const delta = dragStart.current.y - e.clientY; // upward = increase
    const newBpm = Math.round(
      Math.min(MAX_BPM, Math.max(MIN_BPM, dragStart.current.bpm + delta * 0.5))
    );
    setBpm(newBpm);
    audioEngine.setBpm(newBpm);
  }, [setBpm]);

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newBpm = Math.min(MAX_BPM, Math.max(MIN_BPM, bpm + delta));
    setBpm(newBpm);
    audioEngine.setBpm(newBpm);
  }, [bpm, setBpm]);

  // Visual: rotate knob -135° to +135° mapped over MIN_BPM..MAX_BPM
  const pct = (bpm - MIN_BPM) / (MAX_BPM - MIN_BPM);
  const deg = -135 + pct * 270;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        title="Drag up/down or scroll to change BPM"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, var(--bg-3), var(--bg-1))',
          border: '2px solid var(--border-light)',
          cursor: 'ns-resize',
          position: 'relative',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Indicator dot */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${deg}deg)`,
        }}>
          <div style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 4px var(--accent-glow)',
            position: 'absolute',
            top: 5,
          }} />
        </div>
      </div>
      <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
        {bpm}
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.05em' }}>
        BPM
      </span>
    </div>
  );
}
