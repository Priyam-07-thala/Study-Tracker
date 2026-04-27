import React from 'react'
export default function ProgressBar({ pct = 0, showLabel = true }) {
  const color = pct >= 100 ? 'var(--green)' : 'var(--accent)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
      {showLabel && <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', minWidth: '36px', textAlign: 'right' }}>{pct.toFixed(0)}%</span>}
    </div>
  )
}
