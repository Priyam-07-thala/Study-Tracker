import React from 'react'
import Spinner from './Spinner'

function LectureRow({ lecture, onToggle, onEdit, onDelete, onMoveUp, onMoveDown, isPending, onPlay, isActive }) {
  return (
    <div className="lecture-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: isActive ? 'var(--accent-dim)' : lecture.completed ? 'rgba(61,220,132,0.04)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.2s', position: 'relative' }}>
      <div style={{ flexShrink: 0 }}>
        {isPending ? <Spinner size={18} /> : (
          <div onClick={() => onToggle(lecture.id, !lecture.completed)} style={{ width: '20px', height: '20px', border: `2px solid ${lecture.completed ? 'var(--green)' : 'var(--border-hover)'}`, borderRadius: '4px', background: lecture.completed ? 'var(--green)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
            {lecture.completed && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onPlay(lecture)}>
        <div 
          style={{ 
            fontSize: '14px', 
            color: isActive ? 'var(--accent)' : lecture.completed ? 'var(--text-muted)' : 'var(--text)', 
            fontWeight: isActive ? 600 : 400,
            textDecoration: lecture.completed ? 'line-through' : 'none', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            transition: 'color 0.15s'
          }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = lecture.completed ? 'var(--text-muted)' : 'var(--text)' }}
        >
          {isActive ? '▶ ' : ''}{lecture.title}
        </div>
        {lecture.completed_at && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--mono)' }}>completed {new Date(lecture.completed_at).toLocaleDateString()}</div>}
      </div>
      
      <div style={{ display: 'flex', gap: '6px', opacity: 0.7 }}>
        <button onClick={() => onMoveUp(lecture.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', fontSize: '14px' }} title="Move Up">↑</button>
        <button onClick={() => onMoveDown(lecture.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', fontSize: '14px' }} title="Move Down">↓</button>
        <button onClick={() => onEdit(lecture)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }} title="Edit Lecture">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button onClick={() => onDelete(lecture.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }} title="Delete Lecture">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>

      <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', minWidth: '28px', textAlign: 'right' }}>#{lecture.lecture_order + 1}</span>
      <a href={lecture.youtube_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.color = '#ff4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.75 12.17 12.17 0 01-.86-2.68A.18.18 0 0014.78 1H9.22a.18.18 0 00-.18.18 12.17 12.17 0 01-.86 2.68 4.83 4.83 0 01-3.77 2.75.18.18 0 00-.15.18v10.26a.18.18 0 00.15.18 4.83 4.83 0 013.77 2.75 12.17 12.17 0 01.86 2.68.18.18 0 00.18.14h5.56a.18.18 0 00.18-.18 12.17 12.17 0 01.86-2.68 4.83 4.83 0 013.77-2.75.18.18 0 00.15-.18V6.87a.18.18 0 00-.15-.18zM10 15.5l-4-3.5 4-3.5v7zm4 0V8.5l4 3.5-4 3.5z"/></svg>
      </a>
    </div>
  )
}

export default function LectureList({ lectures, loading, error, onToggle, onEdit, onDelete, onMoveUp, onMoveDown, pendingIds, onPlay, activeLectureId }) {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size={32} /></div>
  if (error) return <div style={{ padding: '24px', color: 'var(--red)', fontSize: '14px' }}>Error: {error}</div>
  if (!lectures.length) return <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No lectures yet. Import a YouTube playlist to get started.</div>
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {lectures.map(lec => (
        <LectureRow 
          key={lec.id} 
          lecture={lec} 
          onToggle={onToggle} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onMoveUp={onMoveUp} 
          onMoveDown={onMoveDown} 
          isPending={pendingIds.has(lec.id)} 
          onPlay={onPlay}
          isActive={activeLectureId === lec.id}
        />
      ))}
    </div>
  )
}
