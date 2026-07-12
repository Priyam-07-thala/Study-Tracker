import React from 'react'

export default function SpiralRings({ count = 12 }) {
  return (
    <div 
      className="spiral-rings-gutter"
      style={{ 
        position: 'relative', 
        width: '40px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '30px 0',
        zIndex: 20,
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* Repeating rings list */}
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            height: '24px', 
            position: 'relative' 
          }}
        >
          {/* Left page hole */}
          <div 
            style={{ 
              position: 'absolute',
              left: '4px',
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#dbd7cb', 
              border: '1px solid #b3ac9e', 
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)' 
            }} 
          />
          
          {/* Right page hole */}
          <div 
            style={{ 
              position: 'absolute',
              right: '4px',
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#dbd7cb', 
              border: '1px solid #b3ac9e', 
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)' 
            }} 
          />
          
          {/* Metal binder wire loop */}
          <div 
            style={{ 
              width: '32px', 
              height: '16px', 
              border: '2px solid var(--border)', 
              borderRadius: '50% / 50%',
              background: 'linear-gradient(180deg, #f3f4f6 0%, #d1d5db 55%, #9ca3af 100%)',
              boxShadow: '1px 3px 4px rgba(0,0,0,0.15)',
              position: 'relative',
              zIndex: 5
            }} 
          />
        </div>
      ))}
    </div>
  )
}
