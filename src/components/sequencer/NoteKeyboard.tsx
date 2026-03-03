import React from 'react';
import { soundLibrary } from '../../audio/soundLibrary';

// Pitched synth types — MetalSynth and NoiseSynth are not pitched
const PITCHED_TYPES = new Set(['MembraneSynth', 'MonoSynth', 'FMSynth', 'AMSynth']);

export function isPitchedInstrument(instrumentKey: string): boolean {
  const descriptor = soundLibrary[instrumentKey];
  if (!descriptor) return false;
  return PITCHED_TYPES.has(descriptor.synthType);
}

// Piano layout helpers
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTES = ['C#', 'D#', null, 'F#', 'G#', 'A#', null]; // null = no black key after E, B

function buildOctave(octave: number) {
  const whites: string[] = [];
  const blacks: Array<string | null> = [];
  WHITE_NOTES.forEach((n, i) => {
    whites.push(`${n}${octave}`);
    blacks.push(BLACK_NOTES[i] ? `${BLACK_NOTES[i]}${octave}` : null);
  });
  return { whites, blacks };
}

function getOctaves(instrumentKey: string): number[] {
  const descriptor = soundLibrary[instrumentKey];
  if (!descriptor) return [3, 4];
  if (descriptor.category === 'bass' || descriptor.synthType === 'MembraneSynth') return [1, 2];
  return [3, 4];
}

const KEY_W = 18;
const KEY_H = 52;
const BLACK_W = 11;
const BLACK_H = 32;

interface Props {
  trackId: string;
  instrumentKey: string;
  trackColor: string;
  onKeyClick: (note: string) => void;
  currentNote?: string;
}

export function NoteKeyboard({ instrumentKey, trackColor, onKeyClick, currentNote }: Props) {
  const octaves = getOctaves(instrumentKey);
  const allWhites: string[] = [];
  const allBlacks: Array<{ note: string; offsetWhites: number } | null> = [];

  octaves.forEach((oct) => {
    const { whites, blacks } = buildOctave(oct);
    const base = allWhites.length;
    whites.forEach((n) => allWhites.push(n));
    blacks.forEach((n, i) => {
      if (n) allBlacks.push({ note: n, offsetWhites: base + i });
      else allBlacks.push(null);
    });
  });

  const totalWidth = allWhites.length * KEY_W;

  return (
    <div
      style={{
        padding: '6px 16px 6px 140px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: totalWidth,
          height: KEY_H,
          userSelect: 'none',
        }}
      >
        {/* White keys */}
        {allWhites.map((note, i) => {
          const isActive = note === currentNote;
          return (
            <button
              key={note}
              onClick={() => onKeyClick(note)}
              style={{
                position: 'absolute',
                left: i * KEY_W,
                top: 0,
                width: KEY_W - 1,
                height: KEY_H,
                background: isActive ? trackColor : '#e8e8e8',
                border: '1px solid #aaa',
                borderRadius: '0 0 3px 3px',
                cursor: 'pointer',
                zIndex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 2,
                fontSize: 7,
                color: isActive ? '#fff' : '#666',
                fontWeight: isActive ? 700 : 400,
              }}
              title={note}
            >
              {note}
            </button>
          );
        })}

        {/* Black keys */}
        {allBlacks.map((entry, idx) => {
          if (!entry) return null;
          const { note, offsetWhites } = entry;
          const isActive = note === currentNote;
          return (
            <button
              key={note}
              onClick={() => onKeyClick(note)}
              style={{
                position: 'absolute',
                left: offsetWhites * KEY_W + (KEY_W - BLACK_W / 2) - BLACK_W / 2,
                top: 0,
                width: BLACK_W,
                height: BLACK_H,
                background: isActive ? trackColor : '#222',
                border: '1px solid #000',
                borderRadius: '0 0 2px 2px',
                cursor: 'pointer',
                zIndex: 2,
                boxShadow: isActive ? `0 0 6px ${trackColor}` : 'none',
              }}
              title={note}
            />
          );
        })}
      </div>
    </div>
  );
}
