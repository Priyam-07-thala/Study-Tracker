import React from 'react'
import Spinner from './Spinner'

function LectureRow({ lecture, onToggle, isPending }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: lecture.completed ? 'rgba(61,220,132,0.04)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
      <div style={{ flexShrink: 0 }}>
        {isPending ? <Spinner size={18} /> : (
          <div onClick={() => onToggle(lecture.id, !lecture.completed)} style={{ width: '20px', height: '20px', border: `2px solid ${lecture.completed ? 'var(--green)' : 'var(--border-hover)'}`, borderRadius: '4px', background: lecture.completed ? 'var(--green)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
            {lecture.completed && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', color: lecture.completed ? 'var(--text-muted)' : 'var(--text)', textDecoration: lecture.completed ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lecture.title}</div>
        {lecture.completed_at && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--mono)' }}>completed {new Date(lecture.completed_at).toLocaleDateString()}</div>}
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', minWidth: '28px', textAlign: 'right' }}>#{lecture.lecture_order + 1}</span>
      <a href={lecture.youtube_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.color = '#ff4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.75 12.17 12.17 0 01-.86-2.68A.18.18 0 0014.78 1H9.22a.18.18 0 00-.18.18 12.17 12.17 0 01-.86 2.68 4.83 4.83 0 01-3.77 2.75.18.18 0 00-.15.18v10.26a.18.18 0 00.15.18 4.83 4.83 0 013.77 2.75 12.17 12.17 0 01.86 2.68.18.18 0 00.18.14h5.56a.18.18 0 00.18-.18 12.17 12.17 0 01.86-2.68 4.83 4.83 0 013.77-2.75.18.18 0 00.15-.18V6.87a.18.18 0 00-.15-.18zM10 15.5l-4-3.5 4-3.5v7zm4 0V8.5l4 3.5-4 3.5z"/></svg>
      </a>
    </div>
  )
}

export default function LectureList({ lectures, loading, error, onToggle, pendingIds }) {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size={32} /></div>
  if (error) return <div style={{ padding: '24px', color: 'var(--red)', fontSize: '14px' }}>Error: {error}</div>
  if (!lectures.length) return <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No lectures yet. Import a YouTube playlist to get started.</div>
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {lectures.map(lec => <LectureRow key={lec.id} lecture={lec} onToggle={onToggle} isPending={pendingIds.has(lec.id)} />)}
    </div>
  )
}
