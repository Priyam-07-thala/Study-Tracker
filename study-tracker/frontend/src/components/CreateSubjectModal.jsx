import React, { useState } from 'react'
import { importPlaylist } from '../api/youtube'

export default function CreateSubjectModal({ onClose, onSubmit, onRefresh }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    try { 
      setLoading(true)
      setError(null)
      
      // Step 1: Create the subject
      setStatusMessage('Creating workspace notebook...')
      const created = await onSubmit({ 
        name: name.trim(), 
        description: description.trim() || null 
      })
      
      // Step 2: Optionally import playlist if provided
      if (playlistUrl.trim() && created && created.id) {
        setStatusMessage('Connecting to YouTube & importing lectures... 📺')
        await importPlaylist(created.id, playlistUrl.trim())
      }
      
      if (onRefresh) {
        onRefresh()
      }
      onClose() 
    }
    catch (err) { 
      setError(err.message || 'Failed to create subject.') 
      setStatusMessage('')
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
        {!loading && (
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
        )}

        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px', fontFamily: 'var(--sans)' }}>
          Create New Subject 📒
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
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              DESCRIPTION / NOTE (OPTIONAL)
            </label>
            <textarea 
              className="sketch-input"
              style={{ resize: 'vertical', minHeight: '60px' }} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="What are you learning in this course?" 
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              YOUTUBE PLAYLIST URL (OPTIONAL)
            </label>
            <input 
              className="sketch-input"
              value={playlistUrl} 
              onChange={e => setPlaylistUrl(e.target.value)} 
              placeholder="https://www.youtube.com/playlist?list=..." 
              disabled={loading}
            />
            <small 
              style={{ 
                display: 'block', 
                fontSize: '11px', 
                color: 'var(--text-muted)', 
                fontFamily: 'var(--hand)',
                fontWeight: 'bold', 
                marginTop: '4px' 
              }}
            >
              If provided, Doodly will fetch and import all videos as study lectures!
            </small>
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

          {loading && statusMessage && (
            <div 
              style={{ 
                marginBottom: '20px', 
                fontSize: '14px', 
                fontFamily: 'var(--hand)', 
                fontWeight: 'bold',
                color: 'var(--accent)'
              }}
            >
              ⏳ {statusMessage}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="sketch-btn"
              style={{ padding: '8px 16px' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()} 
              className="sketch-btn sketch-btn-accent"
              style={{ padding: '8px 20px' }}
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
