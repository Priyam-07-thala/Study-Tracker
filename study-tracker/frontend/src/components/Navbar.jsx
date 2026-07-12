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

  // Sidebar links layout for Desktop
  const navLinks = [
    { path: '/', label: '📒 Dashboard' },
  ]

  const activeStyle = {
    background: 'var(--hl-yellow)',
    borderColor: 'var(--border)',
    transform: 'rotate(-0.5deg) translate(-1px, -1px)',
    boxShadow: '2px 2px 0px var(--border)'
  }

  return (
    <>
      {/* Desktop Navigation Page (Sidebar) */}
      <aside 
        className="desktop-nav"
        style={{
          width: '260px',
          background: '#ffffff',
          border: '2px solid var(--border)',
          borderRadius: '15px 4px 4px 15px / 15px 4px 4px 15px',
          boxShadow: '4px 4px 0px var(--border)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)' }}>
            <h1 
              style={{ 
                fontFamily: 'var(--sans)', 
                fontSize: '22px', 
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '2px dashed var(--border)',
                paddingBottom: '10px'
              }}
            >
              📝 <span style={{ color: 'var(--accent)' }}>Study</span>Scribbles
            </h1>
          </Link>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>BUILD PLANS</div>
          
          {navLinks.map(link => {
            const isActive = loc.pathname === link.path
            return (
              <Link 
                key={link.path}
                to={link.path}
                className="nav-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '6px 10px 8px 12px / 8px 12px 10px 8px',
                  border: '2px solid transparent',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: 'var(--text)',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  ...(isActive ? activeStyle : {})
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }
                }}
              >
                {link.label}
              </Link>
            )
          })}
          
          {loc.pathname !== '/' && (
            <Link 
              to="/" 
              style={{ 
                fontSize: '13px', 
                color: 'var(--accent)', 
                marginTop: '10px', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ← Back to Dashboard
            </Link>
          )}

          {/* Decorative sticky tip at bottom of list */}
          <div 
            className="taped taped-yellow" 
            style={{ 
              marginTop: '40px',
              padding: '16px 12px 12px 12px',
              background: 'var(--hl-pink)',
              border: '2px solid var(--border)',
              borderRadius: '8px 10px 12px 6px / 12px 8px 6px 10px',
              transform: 'rotate(1deg)',
              boxShadow: '2px 2px 0px var(--border)'
            }}
          >
            <div style={{ fontFamily: 'var(--hand)', fontSize: '15px', lineHeight: '1.4', color: '#6d28d9', textAlign: 'center' }}>
              "Focus on one micro-goal at a time! You got this! 🌟"
            </div>
          </div>
        </div>

        {/* User Card at Bottom */}
        {username && (
          <div 
            style={{ 
              marginTop: 'auto', 
              paddingTop: '20px', 
              borderTop: '2px dashed var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>👤</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                {username}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="sketch-btn"
              style={{ 
                padding: '6px 12px', 
                fontSize: '12px', 
                justifyContent: 'center',
                width: '100%',
                background: 'var(--hl-blue)'
              }}
            >
              Sign Out 🚪
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Navigation Header */}
      <header 
        className="mobile-nav"
        style={{
          background: '#ffffff',
          border: '2px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '3px 3px 0px var(--border)',
          padding: '12px 16px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)' }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: 800 }}>
            📝 StudyScribbles
          </h1>
        </Link>
        
        {username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loc.pathname !== '/' && (
              <Link to="/" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                ← Dashboard
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="sketch-btn"
              style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--hl-pink)' }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Responsive Breakpoints CSS */}
      <style>{`
        @media (max-width: 800px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav {
            display: flex !important;
          }
        }
      `}</style>
    </>
  )
}
