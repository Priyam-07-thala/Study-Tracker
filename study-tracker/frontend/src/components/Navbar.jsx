import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  const username = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    window.location.href = '/login'
  }

  return (
    <nav style={{ height: '56px', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '24px', position: 'sticky', top: 0, zIndex: 50 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>STUDY<span style={{ color: 'var(--accent)' }}>TRACK</span></span>
      </Link>
      <div style={{ flex: 1 }} />
      {loc.pathname !== '/' && <Link to="/" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>← Dashboard</Link>}
      
      {username && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 500 }}>
            👤 {username}
          </span>
          <button 
            onClick={handleLogout} 
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
