import React, { useState } from 'react'

export default function CreateSubjectModal({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try { setLoading(true); setError(null); await onSubmit({ name: name.trim(), description: description.trim() || null }); onClose() }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>New Subject</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontFamily: 'var(--mono)' }}>NAME *</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Data Structures & Algorithms" autoFocus onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontFamily: 'var(--mono)' }}>DESCRIPTION</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--red)' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '14px' }}>Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} style={{ padding: '9px 20px', background: loading || !name.trim() ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 500 }}>{loading ? 'Creating…' : 'Create Subject'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
