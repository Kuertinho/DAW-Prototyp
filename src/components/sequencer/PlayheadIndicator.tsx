import React from 'react';
import { useTransportStore } from '../../store/useTransportStore';
import { STEP_COUNT } from '../../constants/defaults';

const STEP_SIZE = 40;
const STEP_GAP = 3;
const GROUP_EXTRA = 6; // extra margin before steps 4, 8, 12

function stepOffset(index: number): number {
  // Each step: STEP_SIZE + STEP_GAP, plus GROUP_EXTRA for group starts (4,8,12)
  const groups = Math.floor(index / 4);
  return index * (STEP_SIZE + STEP_GAP) + groups * GROUP_EXTRA;
}

export function PlayheadIndicator() {
  const currentStep = useTransportStore((s) => s.currentStep);
  const isPlaying = useTransportStore((s) => s.isPlaying);

  if (!isPlaying || currentStep < 0) return null;

  const left = stepOffset(currentStep);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left,
        width: STEP_SIZE,
        height: '100%',
        background: 'rgba(255,255,255,0.04)',
        borderTop: '2px solid rgba(255,255,255,0.6)',
        borderRadius: 4,
        pointerEvents: 'none',
        transition: 'left 0.03s linear',
        zIndex: 1,
      }}
    />
  );
}

// Export step count for consumers
export { STEP_COUNT };
