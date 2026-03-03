import React from 'react';

export function TopBar() {
  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'var(--bg-1)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 12,
      flexShrink: 0,
    }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: 'var(--accent)',
        boxShadow: '0 0 8px var(--accent-glow)',
      }} />
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
      }}>
        DAW Prototyp
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }}>
        v0.1
      </span>
    </header>
  );
}
