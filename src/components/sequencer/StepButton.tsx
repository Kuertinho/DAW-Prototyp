import React, { memo } from 'react';
import { useSequencerStore } from '../../store/useSequencerStore';
import { useTransportStore } from '../../store/useTransportStore';

interface Props {
  trackId: string;
  trackColor: string;
  stepIndex: number;
  groupStart: boolean;
  isPitched?: boolean;
}

// Module-level drag state shared across all StepButton instances
let dragTrackId: string | null = null;
let dragStartStep: number | null = null;
let dragOccurred = false;

export const StepButton = memo(function StepButton({
  trackId,
  trackColor,
  stepIndex,
  groupStart,
  isPitched = false,
}: Props) {
  const step = useSequencerStore(
    (s) => s.tracks.find((t) => t.id === trackId)?.steps[stepIndex]
  );
  const active = step?.active ?? false;
  const note = step?.note ?? '';
  const selectedStep = useSequencerStore(
    (s) => s.tracks.find((t) => t.id === trackId)?.selectedStep ?? null
  );
  const isSelected = selectedStep === stepIndex;

  const selection = useSequencerStore((s) => s.selection);
  const isInSelection =
    selection !== null &&
    selection.trackId === trackId &&
    stepIndex >= selection.fromStep &&
    stepIndex <= selection.toStep;

  const isCurrentStep = useTransportStore((s) => s.currentStep === stepIndex);
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const toggleStep = useSequencerStore((s) => s.toggleStep);
  const selectStep = useSequencerStore((s) => s.selectStep);
  const setSelection = useSequencerStore((s) => s.setSelection);

  function handleClick() {
    if (dragOccurred) {
      dragOccurred = false;
      return;
    }
    toggleStep(trackId, stepIndex);
    if (isPitched) {
      selectStep(trackId, isSelected ? null : stepIndex);
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    dragTrackId = trackId;
    dragStartStep = stepIndex;
    dragOccurred = false;
    setSelection(null);
  }

  function handlePointerEnter() {
    if (dragTrackId === trackId && dragStartStep !== null && dragStartStep !== stepIndex) {
      dragOccurred = true;
      const from = Math.min(dragStartStep, stepIndex);
      const to = Math.max(dragStartStep, stepIndex);
      setSelection({ trackId, fromStep: from, toStep: to });
    }
  }

  function handlePointerUp() {
    dragTrackId = null;
    dragStartStep = null;
  }

  return (
    <button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerUp={handlePointerUp}
      style={{
        width: 'var(--step-size)',
        height: 'var(--step-size)',
        borderRadius: 5,
        border: isInSelection
          ? '2px solid #00e5ff'
          : isSelected
          ? '2px solid rgba(255,255,255,0.7)'
          : groupStart
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
        boxShadow: isInSelection
          ? '0 0 6px #00e5ff66'
          : active
          ? `0 0 8px ${trackColor}66`
          : isCurrentStep && isPlaying
          ? '0 0 4px rgba(255,255,255,0.15)'
          : 'none',
        flexShrink: 0,
        marginLeft: groupStart && stepIndex !== 0 ? 6 : 0,
        overflow: 'hidden',
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
      {/* Note label on active pitched steps */}
      {active && isPitched && note && (
        <span style={{
          position: 'absolute',
          bottom: 2,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 7,
          color: 'rgba(255,255,255,0.85)',
          fontWeight: 700,
          pointerEvents: 'none',
          lineHeight: 1,
        }}>
          {note}
        </span>
      )}
    </button>
  );
});
