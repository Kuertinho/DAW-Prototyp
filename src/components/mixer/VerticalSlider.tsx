import React from 'react';

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  height?: number;
  accentColor?: string;
  title?: string;
}

/** Cross-browser vertical range input using CSS rotation (works in Safari). */
export function VerticalSlider({ min, max, value, onChange, height = 80, accentColor, title }: Props) {
  return (
    <div
      style={{
        height,
        width: 20,
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        title={title}
        style={{
          width: height,
          height: 20,
          transform: 'rotate(270deg)',
          transformOrigin: 'center',
          accentColor,
          cursor: 'pointer',
          margin: 0,
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
    </div>
  );
}
