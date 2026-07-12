import React from 'react'

export default function ProgressBar({ pct = 0, showLabel = true }) {
  const fillColor = pct >= 100 ? '#86efac' : '#fef08a' // Green vs Yellow highlighter
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div 
        style={{ 
          flex: 1, 
          height: '14px', 
          background: '#ffffff', 
          border: '2.5px solid var(--border)',
          borderRadius: '6px 4px 7px 5px / 5px 6px 4px 7px',
          overflow: 'hidden',
          padding: '1px',
          boxShadow: '1px 1px 0px var(--border)'
        }}
      >
        <div 
          style={{ 
            width: `${Math.min(pct, 100)}%`, 
            height: '100%', 
            background: fillColor, 
            borderRadius: '2px', 
            transition: 'width 0.4s ease',
            borderRight: pct > 0 && pct < 100 ? '2px solid var(--border)' : 'none'
          }} 
        />
      </div>
      
      {showLabel && (
        <span 
          style={{ 
            fontFamily: 'var(--hand)', 
            fontSize: '15px', 
            fontWeight: 'bold',
            color: 'var(--text-dim)', 
            minWidth: '32px', 
            textAlign: 'right' 
          }}
        >
          {pct.toFixed(0)}%
        </span>
      )}
    </div>
  )
}
