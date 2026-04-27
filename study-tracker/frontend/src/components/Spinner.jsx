import React from 'react'
export default function Spinner({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite', display: 'block' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border)" strokeWidth="2.5"/>
      <path d="M12 2 A10 10 0 0 1 22 12" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
