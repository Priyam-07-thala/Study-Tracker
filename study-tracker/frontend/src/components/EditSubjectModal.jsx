import React, { useState } from 'react'

export default function EditSubjectModal({ subject, onClose, onSubmit }) {
  const [name, setName] = useState(subject.name || '')
  const [description, setDescription] = useState(subject.description || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try { 
      setLoading(true)
      setError(null)
      await onSubmit(subject.id, { name: name.trim(), description: description.trim() || null })
      onClose() 
    }
    catch (err) { 
      setError(err.message) 
    }
    finally { 
      setLoading(false) 
    }
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(44, 42, 41, 0.4)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 100, 
        backdropFilter: 'blur(2px)' 
      }} 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="sketch-border animate-fade-in"
        style={{ 
          background: 'var(--bg-card)', 
          padding: '32px', 
          width: '90%', 
          maxWidth: '460px', 
          boxShadow: '6px 6px 0px var(--border)',
          position: 'relative'
        }}
      >
        {/* Close Button X */}
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: 'var(--text-muted)' 
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ✖
        </button>

        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', fontFamily: 'var(--sans)' }}>
          Edit Subject Details ✏️
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              SUBJECT NAME *
            </label>
            <input 
              className="sketch-input"
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Organic Chemistry, Calculus II" 
              autoFocus 
              required
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              DESCRIPTION / NOTE
            </label>
            <textarea 
              className="sketch-input"
              style={{ resize: 'vertical', minHeight: '80px' }} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Update course goals..." 
            />
          </div>
          
          {error && (
            <div 
              className="sketch-border-sm" 
              style={{ 
                marginBottom: '20px', 
                padding: '10px 14px', 
                background: 'var(--hl-pink)', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: 'var(--red)' 
              }}
            >
              ⚠️ {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="sketch-btn"
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="sketch-btn sketch-btn-accent"
              style={{ padding: '8px 20px' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
