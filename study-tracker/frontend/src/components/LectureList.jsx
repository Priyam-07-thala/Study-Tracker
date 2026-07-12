import React from 'react'
import Spinner from './Spinner'

function LectureRow({ lecture, onToggle, onEdit, onDelete, onMoveUp, onMoveDown, isPending, onPlay, isActive }) {
  return (
    <div 
      className="lecture-row animate-fade-in" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '10px 14px', 
        background: isActive ? 'var(--hl-blue)' : lecture.completed ? 'rgba(43, 140, 83, 0.04)' : 'transparent', 
        borderBottom: '1.5px dashed var(--border)', 
        transition: 'all 0.15s ease', 
        position: 'relative' 
      }}
      onMouseEnter={e => {
        if (!isActive && !lecture.completed) e.currentTarget.style.background = 'var(--hl-yellow)'
      }}
      onMouseLeave={e => {
        if (!isActive && !lecture.completed) e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Checkbox wrapper */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {isPending ? (
          <Spinner size={16} />
        ) : (
          <div 
            onClick={() => onToggle(lecture.id, !lecture.completed)} 
            style={{ 
              width: '18px', 
              height: '18px', 
              border: '2px solid var(--border)', 
              borderRadius: '5px 4px 6px 5px / 5px 5px 4px 6px', 
              background: lecture.completed ? 'var(--hl-green)' : '#ffffff', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              transition: 'all 0.15s',
              boxShadow: '1px 1px 0px var(--border)'
            }}
          >
            {lecture.completed && (
              <svg width="10" height="10" viewBox="0 0 12 12" style={{ overflow: 'visible' }}>
                <path 
                  d="M2 6l2.5 3 5.5-7.5" 
                  stroke="var(--green)" 
                  strokeWidth="2.5" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Lecture Title */}
      <div 
        style={{ flex: 1, minWidth: 0, cursor: 'pointer', paddingLeft: '4px' }} 
        onClick={() => onPlay(lecture)}
      >
        <div 
          style={{ 
            fontSize: '15px', 
            fontFamily: 'var(--sans)',
            fontWeight: 'bold',
            color: isActive ? 'var(--accent)' : lecture.completed ? 'var(--text-muted)' : 'var(--text)', 
            textDecoration: lecture.completed ? 'line-through' : 'none', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            transition: 'color 0.15s'
          }}
        >
          {isActive ? '▶ ' : ''}{lecture.title}
        </div>
        
        {lecture.completed_at && (
          <div 
            style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)', 
              marginTop: '1px', 
              fontFamily: 'var(--hand)',
              fontWeight: 'bold'
            }}
          >
            Finished on {new Date(lecture.completed_at).toLocaleDateString()} 🎓
          </div>
        )}
      </div>
      
      {/* Reordering and Editing controls */}
      <div style={{ display: 'flex', gap: '3px', opacity: 0.7, alignItems: 'center' }}>
        <button 
          onClick={() => onMoveUp(lecture.id)} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', fontSize: '13px', fontWeight: 'bold' }} 
          title="Move Up"
        >
          ↑
        </button>
        <button 
          onClick={() => onMoveDown(lecture.id)} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', fontSize: '13px', fontWeight: 'bold' }} 
          title="Move Down"
        >
          ↓
        </button>
        <button 
          onClick={() => onEdit(lecture)} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }} 
          title="Edit Title"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button 
          onClick={() => onDelete(lecture.id)} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }} 
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          title="Delete Lecture"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>

      {/* Index marker */}
      <span 
        style={{ 
          fontFamily: 'var(--hand)', 
          fontSize: '13px', 
          fontWeight: 'bold',
          color: 'var(--text-muted)', 
          minWidth: '24px', 
          textAlign: 'right' 
        }}
      >
        #{lecture.lecture_order + 1}
      </span>

      {/* Embedded video player trigger */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPlay(lecture); }} 
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer', 
          color: isActive ? 'var(--accent)' : 'var(--text-muted)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '4px' 
        }} 
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} 
        onMouseLeave={e => e.currentTarget.style.color = isActive ? 'var(--accent)' : 'var(--text-muted)'} 
        title="Play Embedded"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>

      {/* External Link */}
      <a 
        href={lecture.youtube_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={e => e.stopPropagation()} 
        style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }} 
        onMouseEnter={e => e.currentTarget.style.color = '#ff4444'} 
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'} 
        title="Open in YouTube"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    </div>
  )
}

export default function LectureList({ lectures, loading, error, onToggle, onEdit, onDelete, onMoveUp, onMoveDown, pendingIds, onPlay, activeLectureId }) {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size={32} /></div>
  if (error) return <div style={{ padding: '24px', color: 'var(--red)', fontSize: '14px', fontWeight: 'bold' }}>⚠️ Error: {error}</div>
  
  if (!lectures.length) {
    return (
      <div 
        style={{ 
          padding: '48px 24px', 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          fontFamily: 'var(--hand)',
          fontWeight: 'bold',
          fontSize: '16px' 
        }}
      >
        No lectures imported yet. Click "Import Playlist" above to add videos!
      </div>
    )
  }

  return (
    <div 
      className="sketch-border-sm" 
      style={{ 
        border: '2px solid var(--border)', 
        overflow: 'hidden', 
        background: '#ffffff',
        backgroundImage: 'linear-gradient(rgba(44, 42, 41, 0.03) 1px, transparent 1px)',
        backgroundSize: '100% 32px'
      }}
    >
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
