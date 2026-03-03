import React, { memo } from 'react';
import { useSequencerStore } from '../../store/useSequencerStore';
import { useTransportStore } from '../../store/useTransportStore';

interface Props {
  trackId: string;
  trackColor: string;
  stepIndex: number;
  groupStart: boolean; // first step of a 4-step group
}

export const StepButton = memo(function StepButton({ trackId, trackColor, stepIndex, groupStart }: Props) {
  // Subscribe to only this step's active state
  const active = useSequencerStore(
    (s) => s.tracks.find((t) => t.id === trackId)?.steps[stepIndex]?.active ?? false
  );
  const isCurrentStep = useTransportStore((s) => s.currentStep === stepIndex);
  const toggleStep = useSequencerStore((s) => s.toggleStep);

  const isPlaying = useTransportStore((s) => s.isPlaying);

  return (
    <button
      onClick={() => toggleStep(trackId, stepIndex)}
      style={{
        width: 'var(--step-size)',
        height: 'var(--step-size)',
        borderRadius: 5,
        border: groupStart
          ? '1px solid var(--border-light)'
          : '1px solid var(--border)',
        background: active
          ? trackColor
          : isCurrentStep && isPlaying
          ? 'var(--bg-4)'
          : 'var(--step-inactive)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.04s ease',
        boxShadow: active
          ? `0 0 8px ${trackColor}66`
          : isCurrentStep && isPlaying
          ? '0 0 4px rgba(255,255,255,0.15)'
          : 'none',
        flexShrink: 0,
        marginLeft: groupStart && stepIndex !== 0 ? 6 : 0,
      }}
      aria-pressed={active}
      aria-label={`Step ${stepIndex + 1}${active ? ' active' : ''}`}
    >
      {/* Inner LED shine */}
      {active && (
        <div style={{
          position: 'absolute',
          top: 3,
          left: 4,
          width: '40%',
          height: '35%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          pointerEvents: 'none',
        }} />
      )}
    </button>
  );
});
