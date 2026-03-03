import React, { useRef, useCallback } from 'react';
import { Track, PianoRollNote } from '../../types/sequencer';
import { useSequencerStore } from '../../store/useSequencerStore';
import { useTransportStore } from '../../store/useTransportStore';

// Layout constants
const CELL_W = 40;
const CELL_H = 14;
const SIDEBAR_W = 32;
const RESIZE_HANDLE_W = 6;

// Build pitch rows: B5 → C2 (high to low), 4 octaves
const NOTE_NAMES_DESC = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];
const OCTAVES = [5, 4, 3, 2];
const BLACK_NOTE_NAMES = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);

const PITCH_ROWS: string[] = [];
OCTAVES.forEach((oct) => {
  NOTE_NAMES_DESC.forEach((name) => {
    PITCH_ROWS.push(`${name}${oct}`);
  });
});

function isBlackNote(note: string): boolean {
  const name = note.replace(/\d/g, '');
  return BLACK_NOTE_NAMES.has(name);
}

interface ResizeDragState {
  noteId: string;
  startX: number;
  startDuration: number;
}

interface Props {
  track: Track;
}

export function PianoRoll({ track }: Props) {
  const addPianoRollNote = useSequencerStore((s) => s.addPianoRollNote);
  const removePianoRollNote = useSequencerStore((s) => s.removePianoRollNote);
  const resizePianoRollNote = useSequencerStore((s) => s.resizePianoRollNote);
  const stepCount = useSequencerStore((s) => s.stepCount);
  const currentStep = useTransportStore((s) => s.currentStep);
  const isPlaying = useTransportStore((s) => s.isPlaying);

  const resizeDragRef = useRef<ResizeDragState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const numPitches = PITCH_ROWS.length;
  const gridWidth = stepCount * CELL_W;
  const gridHeight = numPitches * CELL_H;

  function handleCellClick(e: React.MouseEvent, pitchIndex: number, stepIndex: number) {
    // Check if clicking on existing note body
    const note = PITCH_ROWS[pitchIndex];
    const existing = track.pianoRollNotes.find(
      (n) => n.note === note && n.startStep === stepIndex
    );
    if (existing) {
      removePianoRollNote(track.id, existing.id);
    } else {
      addPianoRollNote(track.id, {
        id: `${track.id}-${pitchIndex}-${stepIndex}-${Date.now()}`,
        startStep: stepIndex,
        durationSteps: 1,
        note,
        velocity: 1,
      });
    }
  }

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, note: PianoRollNote) => {
      e.stopPropagation();
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      resizeDragRef.current = {
        noteId: note.id,
        startX: e.clientX,
        startDuration: note.durationSteps,
      };
    },
    []
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent, note: PianoRollNote) => {
      if (!resizeDragRef.current || resizeDragRef.current.noteId !== note.id) return;
      const dx = e.clientX - resizeDragRef.current.startX;
      const deltaCells = Math.round(dx / CELL_W);
      const newDuration = Math.max(1, resizeDragRef.current.startDuration + deltaCells);
      resizePianoRollNote(track.id, note.id, newDuration);
    },
    [track.id, resizePianoRollNote]
  );

  const handleResizePointerUp = useCallback(() => {
    resizeDragRef.current = null;
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        overflow: 'auto',
        maxHeight: 200,
        background: 'var(--bg-1)',
        flex: 1,
      }}
    >
      {/* Sidebar: pitch labels */}
      <div
        style={{
          width: SIDEBAR_W,
          flexShrink: 0,
          position: 'sticky',
          left: 0,
          zIndex: 2,
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {PITCH_ROWS.map((pitch) => {
          const black = isBlackNote(pitch);
          return (
            <div
              key={pitch}
              style={{
                height: CELL_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 3,
                fontSize: 7,
                color: black ? 'var(--text-muted)' : 'var(--text-secondary)',
                background: black ? 'var(--bg-3)' : 'var(--bg-2)',
                borderBottom: '1px solid var(--border)',
                userSelect: 'none',
              }}
            >
              {pitch}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        style={{
          position: 'relative',
          width: gridWidth,
          height: gridHeight,
          flexShrink: 0,
        }}
      >
        {/* Row backgrounds */}
        {PITCH_ROWS.map((pitch, pi) => {
          const black = isBlackNote(pitch);
          return (
            <div
              key={pitch}
              style={{
                position: 'absolute',
                top: pi * CELL_H,
                left: 0,
                width: gridWidth,
                height: CELL_H,
                background: black ? 'var(--bg-2)' : 'var(--bg-1)',
                borderBottom: '1px solid var(--border)',
              }}
            />
          );
        })}

        {/* Column backgrounds + beat markers */}
        {Array.from({ length: stepCount }, (_, si) => (
          <div
            key={si}
            style={{
              position: 'absolute',
              top: 0,
              left: si * CELL_W,
              width: CELL_W,
              height: gridHeight,
              borderLeft: si % 4 === 0
                ? '1px solid var(--border-light)'
                : '1px solid var(--border)',
              background: 'transparent',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Clickable cell overlay */}
        {PITCH_ROWS.map((_, pi) =>
          Array.from({ length: stepCount }, (__, si) => (
            <div
              key={`${pi}-${si}`}
              onClick={(e) => handleCellClick(e, pi, si)}
              style={{
                position: 'absolute',
                top: pi * CELL_H,
                left: si * CELL_W,
                width: CELL_W,
                height: CELL_H,
                cursor: 'pointer',
                zIndex: 1,
              }}
            />
          ))
        )}

        {/* Notes */}
        {track.pianoRollNotes.map((note) => {
          const pitchIndex = PITCH_ROWS.indexOf(note.note);
          if (pitchIndex === -1) return null;

          const noteWidth = note.durationSteps * CELL_W - 2;
          return (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                top: pitchIndex * CELL_H + 1,
                left: note.startStep * CELL_W + 1,
                width: noteWidth,
                height: CELL_H - 2,
                background: track.color,
                borderRadius: 3,
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                overflow: 'hidden',
                boxShadow: `0 0 4px ${track.color}88`,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                removePianoRollNote(track.id, note.id);
              }}
            >
              {/* Note label */}
              <span style={{
                fontSize: 7,
                color: 'rgba(255,255,255,0.9)',
                paddingLeft: 2,
                fontWeight: 700,
                pointerEvents: 'none',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}>
                {note.note}
              </span>

              {/* Resize handle */}
              <div
                onPointerDown={(e) => handleResizePointerDown(e, note)}
                onPointerMove={(e) => handleResizePointerMove(e, note)}
                onPointerUp={handleResizePointerUp}
                style={{
                  width: RESIZE_HANDLE_W,
                  height: '100%',
                  background: 'rgba(255,255,255,0.3)',
                  cursor: 'ew-resize',
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          );
        })}

        {/* Playhead */}
        {isPlaying && currentStep >= 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: currentStep * CELL_W,
              width: 2,
              height: gridHeight,
              background: 'rgba(255,255,255,0.7)',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
