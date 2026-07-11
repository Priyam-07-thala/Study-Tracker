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
      
      // Save credentials in localStorage
      localStorage.setItem('user_id', data.id)
      localStorage.setItem('username', data.username)

      // Redirect to main page
      window.location.href = '/'
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', padding: '24px', background: 'radial-gradient(circle at 10% 20%, rgba(124,106,247,0.08) 0%, transparent 40%)' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '36px', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative background glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.1, filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '8px', color: 'var(--text)' }}>
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {isLogin ? 'Log in to track your study goals' : 'Create an account to begin tracking'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.2)', borderRadius: '8px', color: 'var(--red)', fontSize: '13px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Priyam07"
              disabled={submitting}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', transition: 'border-color 0.15s, box-shadow 0.15s', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-dim)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', transition: 'border-color 0.15s, box-shadow 0.15s', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-dim)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '11px 16px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--accent)' }}
          >
            {submitting ? <Spinner size={16} /> : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 600, marginLeft: '6px', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
