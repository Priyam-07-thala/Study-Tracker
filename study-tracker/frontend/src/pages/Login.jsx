import React, { useState } from 'react'
import { login, register } from '../api/auth'
import Spinner from '../components/Spinner'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      let data
      if (isLogin) {
        data = await login(username.trim(), password)
      } else {
        data = await register(username.trim(), password)
      }
      
      localStorage.setItem('user_id', data.id)
      localStorage.setItem('username', data.username)
      window.location.href = '/'
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', width: '100%', padding: '24px' }}>
      
      {/* Notebook Front Cover */}
      <div 
        className="sketch-border"
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          background: '#d97706', /* Leather/Craft cardboard brown cover */
          padding: '36px 28px', 
          boxShadow: '8px 8px 0px var(--border)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px 4px 4px 16px / 16px 4px 4px 16px', // Spine rounded on the left
          borderLeft: '12px solid var(--border)' // Black binder spine representation
        }}
      >
        {/* Sketchy Doodles drawn in graphite on the cover */}
        <div style={{ position: 'absolute', top: '12px', right: '16px', opacity: 0.15, pointerEvents: 'none', transform: 'rotate(10deg)' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M12 20v2M17.66 17.66l1.41 1.41M20 12h2M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>
        </div>
        <div style={{ position: 'absolute', bottom: '16px', left: '18px', opacity: 0.15, pointerEvents: 'none', transform: 'rotate(-15deg)' }}>
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>

        {/* Big Handwritten Title on Cover */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 
            style={{ 
              fontFamily: 'var(--marker)', 
              fontSize: '28px', 
              color: '#ffffff', 
              textShadow: '2px 2px 0px var(--border)',
              letterSpacing: '1px',
              marginBottom: '4px'
            }}
          >
            StudyScribbles ✏️
          </h1>
          <p style={{ fontFamily: 'var(--hand)', fontSize: '16px', color: '#fef3c7', fontWeight: 'bold' }}>
            smart handwriting tracker & planner
          </p>
        </div>

        {/* Taped White Notebook Sheet (Front Label/Form) */}
        <div 
          className="sketch-border taped taped-yellow"
          style={{
            background: '#ffffff',
            padding: '24px 20px',
            boxShadow: '3px 3px 0px var(--border)',
            transform: 'rotate(-0.5deg)',
            borderRadius: '6px 8px 5px 7px / 7px 5px 8px 6px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--sans)' }}>
              {isLogin ? 'Student Sign In 🔓' : 'Register Account 📝'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold', marginTop: '2px' }}>
              {isLogin ? 'Open your workbook to continue studies' : 'Create an account to begin tracking'}
            </p>
          </div>

          {error && (
            <div 
              className="sketch-border-sm" 
              style={{ 
                padding: '8px 12px', 
                background: 'var(--hl-pink)', 
                color: 'var(--red)', 
                fontSize: '13px', 
                fontWeight: 'bold', 
                marginBottom: '16px', 
                display: 'flex', 
                gap: '6px', 
                alignItems: 'center' 
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label 
                style={{ 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: 'var(--text-muted)', 
                  marginBottom: '2px', 
                  fontFamily: 'var(--sans)' 
                }}
              >
                USERNAME
              </label>
              <input
                type="text"
                className="sketch-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Priyam07"
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label 
                style={{ 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: 'var(--text-muted)', 
                  marginBottom: '2px', 
                  fontFamily: 'var(--sans)' 
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                className="sketch-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="sketch-btn sketch-btn-accent"
              style={{ 
                width: '100%', 
                marginTop: '12px', 
                justifyContent: 'center', 
                padding: '10px 16px',
                fontSize: '15px'
              }}
            >
              {submitting ? <Spinner size={16} /> : isLogin ? 'Sign In 🔑' : 'Register Account ✏️'}
            </button>
          </form>

          {/* Toggle Login/Sign-up */}
          <div style={{ marginTop: '20px', borderTop: '1.5px dashed var(--border)', paddingTop: '14px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
              {isLogin ? "First time study planner?" : 'Already have a workbook?'}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--accent)', 
                  fontWeight: 'bold', 
                  marginLeft: '4px', 
                  fontSize: '13px', 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  fontFamily: 'var(--hand)'
                }}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
