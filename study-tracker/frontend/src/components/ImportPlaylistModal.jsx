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
    try { setLoading(true); setError(null); setResult(await importPlaylist(subjectId, url.trim())) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Import YouTube Playlist</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Paste a YouTube playlist URL. All videos will be fetched and stored as lectures.</p>
        {result ? (
          <div>
            <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(61,220,132,0.25)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: '8px' }}>✓ Import complete</div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                <div>Inserted: {result.inserted}</div>
                <div>Skipped (duplicates): {result.skipped}</div>
                <div>Total fetched: {result.total_fetched}</div>
              </div>
            </div>
            <button onClick={() => { onSuccess(); onClose() }} style={{ width: '100%', padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 500 }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', marginBottom: '16px' }} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/playlist?list=PL..." autoFocus onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--red)' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '14px' }}>Cancel</button>
              <button type="submit" disabled={loading || !url.trim()} style={{ padding: '9px 20px', background: loading || !url.trim() ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 500 }}>{loading ? 'Importing…' : 'Import Playlist'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
