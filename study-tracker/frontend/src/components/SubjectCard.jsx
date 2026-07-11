import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

const COLORS = ['#7c6af7', '#3ddc84', '#f5c542', '#ff5c5c', '#60b4ff', '#ff9f40']

export default function SubjectCard({ subject, index, onEditRequest, onDeleteRequest, onPauseRequest, onResumeRequest }) {
  const navigate = useNavigate()
  const accent = COLORS[index % COLORS.length]
  const cardColor = subject.is_paused ? 'var(--text-muted)' : accent

  return (
    <div
      onClick={() => navigate(`/subject/${subject.id}`)}
      style={{ 
        background: 'var(--bg-2)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '24px', 
        cursor: 'pointer', 
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)', 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow)'
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.borderColor = accent + '50'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 30px ${accent}12`
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
    >
      {/* Accent Top Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: cardColor, borderRadius: '18px 18px 0 0' }} />
      
      {/* Decorative Glow */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '120px', height: '120px', borderRadius: '50%', background: cardColor, opacity: 0.03, filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject.name}</span>
            {subject.is_paused && (
              <span style={{ fontSize: '9px', padding: '2px 8px', background: 'var(--bg-3)', color: 'var(--text-muted)', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 700, border: '1px solid var(--border)', letterSpacing: '0.05em' }}>
                Paused
              </span>
            )}
          </h3>
          {subject.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {subject.description}
            </p>
          )}
        </div>

        {/* Action Buttons Container */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ display: 'flex', gap: '2px', background: 'var(--bg-3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}
        >
          {subject.is_paused ? (
            <button 
              onClick={onResumeRequest} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '5px', color: 'var(--green)', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} 
              onMouseEnter={e => e.currentTarget.style.background = 'var(--green-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Resume Subject"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
          ) : (
            <button 
              onClick={onPauseRequest} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '5px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} 
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Pause Subject"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            </button>
          )}
          <button 
            onClick={onEditRequest} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '5px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} 
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Edit Subject"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button 
            onClick={onDeleteRequest} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '5px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} 
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,92,92,0.1)'; e.currentTarget.style.color = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)' }}
            title="Delete Subject"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <ProgressBar pct={subject.completion_percentage} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
          <span>{subject.completed_lectures} / {subject.total_lectures} LECTURES</span>
          {subject.completion_percentage >= 100 ? (
            <span style={{ color: 'var(--green)' }}>COMPLETE</span>
          ) : (
            <span>{Math.round(subject.completion_percentage)}%</span>
          )}
        </div>
      </div>
    </div>
  )
}
