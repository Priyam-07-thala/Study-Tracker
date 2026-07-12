import React from 'react'

export default function Mascot({ message = "Let's study something cool today!" }) {
  return (
    <div 
      className="animate-fade-in"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        margin: '28px 0', 
        background: 'var(--hl-orange)', 
        border: '2px solid var(--border)', 
        borderRadius: '12px 8px 16px 10px / 8px 12px 10px 14px', 
        padding: '16px', 
        boxShadow: '3px 3px 0 var(--border)', 
        position: 'relative',
        minHeight: '80px'
      }}
    >
      {/* Speech bubble pointer */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '92px', 
          top: '50%', 
          transform: 'translateY(-50%) rotate(45deg)', 
          width: '14px', 
          height: '14px', 
          background: 'var(--hl-orange)', 
          borderLeft: '2px solid var(--border)', 
          borderBottom: '2px solid var(--border)', 
          zIndex: 1 
        }} 
      />
      
      {/* Doodly SVG Mascot (absolute on left) */}
      <div 
        style={{ 
          width: '64px', 
          height: '64px', 
          flexShrink: 0, 
          position: 'absolute', 
          left: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          zIndex: 2
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          {/* Head (Sketchy circle) */}
          <path 
            d="M 50,22 C 64,22 68,34 66,46 C 63,56 52,58 39,55 C 30,52 32,34 39,26 C 42,22 46,22 50,22" 
            fill="#ffffff" 
            stroke="var(--border)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          {/* Hair spikes */}
          <path d="M 42,22 Q 40,12 45,16" fill="none" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 49,20 Q 50,10 54,16" fill="none" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 56,21 Q 59,12 61,17" fill="none" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="44" cy="36" r="3" fill="var(--border)" />
          <circle cx="56" cy="36" r="3" fill="var(--border)" />
          {/* Blush cheeks */}
          <ellipse cx="40" cy="40" rx="3" ry="2" fill="#fbcfe8" opacity="0.8" />
          <ellipse cx="60" cy="40" rx="3" ry="2" fill="#fbcfe8" opacity="0.8" />
          {/* Smile */}
          <path d="M 45,44 C 47,48 53,48 55,44" fill="none" stroke="var(--border)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Body */}
          <path d="M 50,56 Q 50,82 50,82" fill="none" stroke="var(--border)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Arms (waving/happy) */}
          <path d="M 50,60 C 38,60 30,53 24,46" fill="none" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50,60 C 60,63 70,53 74,44" fill="none" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
          {/* Legs */}
          <path d="M 50,82 Q 42,92 40,92" fill="none" stroke="var(--border)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 50,82 Q 58,92 60,92" fill="none" stroke="var(--border)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Speech bubble text */}
      <div 
        style={{ 
          flex: 1, 
          zIndex: 2, 
          paddingLeft: '80px',
          fontFamily: 'var(--hand)', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          lineHeight: '1.4', 
          color: 'var(--text)' 
        }}
      >
        {message}
      </div>
    </div>
  )
}
