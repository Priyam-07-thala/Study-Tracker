import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

const HIGHLIGHTER_COLORS = [
  'var(--hl-purple)', 
  'var(--hl-green)', 
  'var(--hl-yellow)', 
  'var(--hl-pink)', 
  'var(--hl-blue)', 
  'var(--hl-orange)'
]

export default function SubjectCard({ subject, index, onEditRequest, onDeleteRequest, onPauseRequest, onResumeRequest }) {
  const navigate = useNavigate()
  const baseColor = HIGHLIGHTER_COLORS[index % HIGHLIGHTER_COLORS.length]
  const cardBackground = subject.is_paused ? '#eae6dc' : baseColor

  return (
    <div
      onClick={() => navigate(`/subject/${subject.id}`)}
      className="sketch-border animate-fade-in"
      style={{ 
        background: cardBackground, 
        padding: '24px', 
        cursor: 'pointer', 
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: '4px 4px 0px var(--border)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '200px'
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.transform = 'translate(-2px, -2px)'
        e.currentTarget.style.boxShadow = '6px 6px 0px var(--border)'
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = '4px 4px 0px var(--border)'
      }}
    >
      {/* Tape style binder top */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '10px', 
          background: 'rgba(0,0,0,0.1)', 
          borderBottom: '2px solid var(--border)' 
        }} 
      />

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginTop: '6px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 
            style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              fontFamily: 'var(--sans)',
              marginBottom: '6px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--text)' 
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {subject.name}
            </span>
            {subject.is_paused && (
              <span 
                style={{ 
                  fontSize: '10px', 
                  padding: '1px 6px', 
                  background: 'var(--bg-card)', 
                  color: 'var(--text-muted)', 
                  borderRadius: '4px', 
                  textTransform: 'uppercase', 
                  fontWeight: 'bold', 
                  border: '1.5px solid var(--border)',
                  fontFamily: 'var(--sans)'
                }}
              >
                Paused
              </span>
            )}
          </h3>
          
          {subject.description && (
            <p 
              style={{ 
                fontSize: '14px', 
                fontFamily: 'var(--hand)',
                fontWeight: 'bold',
                color: 'var(--text-muted)', 
                lineHeight: '1.4', 
                overflow: 'hidden', 
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical' 
              }}
            >
              {subject.description}
            </p>
          )}
        </div>

        {/* Mini sketchy controls container */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ 
            display: 'flex', 
            gap: '2px', 
            background: 'var(--bg-card)', 
            padding: '2px', 
            borderRadius: '6px', 
            border: '2px solid var(--border)',
            boxShadow: '1.5px 1.5px 0px var(--border)',
            flexShrink: 0
          }}
        >
          {subject.is_paused ? (
            <button 
              onClick={onResumeRequest} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', color: 'var(--green)', display: 'flex', alignItems: 'center' }} 
              title="Resume"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
          ) : (
            <button 
              onClick={onPauseRequest} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} 
              title="Pause"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            </button>
          )}
          <button 
            onClick={onEditRequest} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} 
            title="Edit"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button 
            onClick={onDeleteRequest} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} 
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Delete"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
        <ProgressBar pct={subject.completion_percentage} showLabel={false} />
        
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '8px', 
            fontSize: '13px', 
            color: 'var(--text-muted)', 
            fontFamily: 'var(--hand)', 
            fontWeight: 'bold' 
          }}
        >
          <span>{subject.completed_lectures} / {subject.total_lectures} lectures</span>
          {subject.completion_percentage >= 100 ? (
            <span style={{ color: 'var(--green)', fontWeight: 800 }}>COMPLETE! 🌟</span>
          ) : (
            <span>{Math.round(subject.completion_percentage)}%</span>
          )}
        </div>
      </div>
    </div>
  )
}
