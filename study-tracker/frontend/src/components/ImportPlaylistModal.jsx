import React, { useState } from 'react'
import { importPlaylist } from '../api/youtube'

export default function ImportPlaylistModal({ subjectId, onClose, onSuccess }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    try { 
      setLoading(true)
      setError(null)
      const res = await importPlaylist(subjectId, url.trim())
      setResult(res)
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
          maxWidth: '500px', 
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

        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', fontFamily: 'var(--sans)' }}>
          Import YouTube Playlist 📺
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold', marginBottom: '24px' }}>
          Paste a YouTube playlist link to fetch all videos as study lectures!
        </p>

        {result ? (
          <div>
            <div 
              className="sticky-note taped taped-yellow"
              style={{ 
                background: 'var(--hl-green)', 
                marginBottom: '24px',
                padding: '20px 16px',
                transform: 'rotate(-0.5deg)'
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--green)', marginBottom: '10px', fontSize: '16px' }}>
                ✓ Playlist Imported Successfully!
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
                <div style={{ marginBottom: '4px' }}>• New Lectures Inserted: {result.inserted}</div>
                <div style={{ marginBottom: '4px' }}>• Skipped (Already Exists): {result.skipped}</div>
                <div style={{ borderTop: '1.5px dashed var(--border)', paddingTop: '6px', marginTop: '6px' }}>• Total Playlist Videos: {result.total_fetched}</div>
              </div>
            </div>
            
            <button 
              onClick={() => { onSuccess(); onClose() }} 
              className="sketch-btn sketch-btn-accent"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done! Let's study ✏️
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                YOUTUBE PLAYLIST URL
              </label>
              <input 
                className="sketch-input"
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://www.youtube.com/playlist?list=PL..." 
                autoFocus 
                required
                disabled={loading}
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
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !url.trim()} 
                className="sketch-btn sketch-btn-accent"
              >
                {loading ? 'Importing playlist...' : 'Import Playlist'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
