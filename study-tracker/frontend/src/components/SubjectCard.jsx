import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

const COLORS = ['#7c6af7','#3ddc84','#f5c542','#ff6b6b','#60b4ff','#ff9f40']

export default function SubjectCard({ subject, index }) {
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
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{subject.name}</h3>
        {subject.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{subject.description}</p>}
      </div>
      <ProgressBar pct={subject.completion_percentage} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        <span>{subject.completed_lectures}/{subject.total_lectures} lectures</span>
        {subject.completion_percentage >= 100 && <span style={{ color: 'var(--green)' }}>✓ Complete</span>}
      </div>
    </div>
  )
}
