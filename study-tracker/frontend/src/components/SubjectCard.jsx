import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

const COLORS = ['#7c6af7','#3ddc84','#f5c542','#ff6b6b','#60b4ff','#ff9f40']

export default function SubjectCard({ subject, index, onEditRequest, onDeleteRequest }) {
  const navigate = useNavigate()
  const accent = COLORS[index % COLORS.length]
  return (
    <div
      onClick={() => navigate(`/subject/${subject.id}`)}
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '80'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${accent}15` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent, borderRadius: '14px 14px 0 0' }} />
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{subject.name}</h3>
          {subject.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{subject.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={(e) => { e.stopPropagation(); onEditRequest && onEditRequest(); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }} title="Edit Subject">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDeleteRequest && onDeleteRequest(); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }} title="Delete Subject">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
      <ProgressBar pct={subject.completion_percentage} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        <span>{subject.completed_lectures}/{subject.total_lectures} lectures</span>
        {subject.completion_percentage >= 100 && <span style={{ color: 'var(--green)' }}>✓ Complete</span>}
      </div>
    </div>
  )
}
