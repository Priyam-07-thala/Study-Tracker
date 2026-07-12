import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LectureList from '../components/LectureList'
import ImportPlaylistModal from '../components/ImportPlaylistModal'
import ProgressChart from '../components/ProgressChart'
import ProgressBar from '../components/ProgressBar'
import Spinner from '../components/Spinner'
import StudyPlan from '../components/StudyPlan'
import EditSubjectModal from '../components/EditSubjectModal'
import { useLectures } from '../hooks/useLectures'
import { useProgress } from '../hooks/useProgress'
import { getSubjects, updateSubject, deleteSubject, pauseSubject, resumeSubject } from '../api/subjects'
import AIAssistant from '../components/AIAssistant'

export default function SubjectPage() {
  const { id } = useParams()
  const subjectId = parseInt(id)
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [subjectLoading, setSubjectLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState('lectures')
  const [activeLecture, setActiveLecture] = useState(null)
  const [showAdTip, setShowAdTip] = useState(() => !localStorage.getItem('hideAdTip'))

  const { lectures, loading: lecturesLoading, error: lecturesError, refetch, toggleLecture, pendingIds, editLectureAction, removeLectureAction, clearLecturesAction, reorderLecturesAction } = useLectures(subjectId)
  const { progress, loading: progressLoading, refetch: refetchProgress } = useProgress(subjectId)

  useEffect(() => {
    getSubjects().then(list => {
      setSubject(list.find(s => s.id === subjectId) || null)
      setSubjectLoading(false)
    }).catch(() => setSubjectLoading(false))
  }, [subjectId, lectures])

  const handleToggle = async (lectureId, completed) => {
    try { await toggleLecture(lectureId, completed); refetchProgress() }
    catch (err) { alert('Failed to update: ' + err.message) }
  }

  const handleEditLecture = async (lecture) => {
    const newTitle = window.prompt("Enter new lecture title:", lecture.title)
    if (newTitle && newTitle.trim() !== lecture.title) {
      try { await editLectureAction(lecture.id, { title: newTitle.trim() }) }
      catch (err) { alert('Failed to rename lecture: ' + err.message) }
    }
  }

  const handlePrevLecture = () => {
    if (!activeLecture) return
    const index = lectures.findIndex(l => l.id === activeLecture.id)
    if (index > 0) {
      setActiveLecture(lectures[index - 1])
    }
  }

  const handleNextLecture = () => {
    if (!activeLecture) return
    const index = lectures.findIndex(l => l.id === activeLecture.id)
    if (index >= 0 && index < lectures.length - 1) {
      setActiveLecture(lectures[index + 1])
    }
  }

  const handleDismissAdTip = () => {
    setShowAdTip(false)
    localStorage.setItem('hideAdTip', 'true')
  }

  const handleDeleteLecture = async (lectureId) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try { 
        await removeLectureAction(lectureId)
        refetchProgress()
        if (activeLecture?.id === lectureId) {
          setActiveLecture(null)
        }
      }
      catch (err) { alert('Failed to delete lecture: ' + err.message) }
    }
  }

  const handleMoveUp = async (lectureId) => {
    const index = lectures.findIndex(l => l.id === lectureId)
    if (index <= 0) return
    const newLectures = [...lectures]
    const temp = newLectures[index]
    newLectures[index] = newLectures[index - 1]
    newLectures[index - 1] = temp
    try { await reorderLecturesAction(newLectures.map(l => l.id)) }
    catch (err) { alert('Failed to reorder: ' + err.message) }
  }

  const handleMoveDown = async (lectureId) => {
    const index = lectures.findIndex(l => l.id === lectureId)
    if (index < 0 || index >= lectures.length - 1) return
    const newLectures = [...lectures]
    const temp = newLectures[index]
    newLectures[index] = newLectures[index + 1]
    newLectures[index + 1] = temp
    try { await reorderLecturesAction(newLectures.map(l => l.id)) }
    catch (err) { alert('Failed to reorder: ' + err.message) }
  }

  const handleClearLectures = async () => {
    if (window.confirm("Are you sure you want to delete ALL lectures in this subject? This action cannot be undone.")) {
      try { await clearLecturesAction(); refetchProgress() }
      catch (err) { alert('Failed to clear lectures: ' + err.message) }
    }
  }

  const handleEditSubject = async (id, payload) => {
    try {
      const updated = await updateSubject(id, payload)
      setSubject(updated)
    } catch (err) { alert('Failed to edit subject: ' + err.message) }
  }

  const handleDeleteSubject = async () => {
    if (window.confirm("Are you sure you want to delete this subject? All associated lectures will be permanently deleted.")) {
      try { await deleteSubject(subjectId); navigate('/') }
      catch (err) { alert('Failed to delete subject: ' + err.message) }
    }
  }

  const handlePauseToggle = async () => {
    if (!subject) return
    try {
      if (subject.is_paused) {
        const updated = await resumeSubject(subjectId)
        setSubject(updated)
      } else {
        const updated = await pauseSubject(subjectId)
        setSubject(updated)
      }
    } catch (err) { alert('Failed to toggle pause: ' + err.message) }
  }

  const completedCount = lectures.filter(l => l.completed).length
  const totalCount = lectures.length
  const pct = totalCount > 0 ? completedCount / totalCount * 100 : 0

  if (subjectLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size={36} /></div>

  return (
    <div className="animate-fade-in" style={{ padding: '10px 0' }}>
      
      {/* Subject Header */}
      <div style={{ marginBottom: '32px', borderBottom: '2.5px solid var(--border)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📖 {subject?.name || `Subject #${subjectId}`}
              </h1>
              
              {subject?.is_paused && (
                <span 
                  style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    background: 'var(--hl-orange)', 
                    color: 'var(--text)', 
                    border: '1.5px solid var(--border)',
                    borderRadius: '4px', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold',
                    fontFamily: 'var(--sans)'
                  }}
                >
                  Paused
                </span>
              )}

              {/* Action items */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '4px', 
                  background: 'var(--bg-card)', 
                  padding: '2px', 
                  borderRadius: '6px', 
                  border: '2px solid var(--border)',
                  boxShadow: '1.5px 1.5px 0px var(--border)' 
                }}
              >
                {subject?.is_paused ? (
                  <button onClick={handlePauseToggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: 'var(--green)' }} title="Resume Workspace">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </button>
                ) : (
                  <button onClick={handlePauseToggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: 'var(--text-muted)' }} title="Pause Workspace">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  </button>
                )}
                <button onClick={() => setShowEdit(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: 'var(--text-muted)' }} title="Edit Subject Details">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button onClick={handleDeleteSubject} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'} title="Delete Subject">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            
            {subject?.description && (
              <p style={{ fontSize: '15px', fontFamily: 'var(--hand)', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '14px' }}>
                {subject.description}
              </p>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ flex: 1, maxWidth: '300px' }}><ProgressBar pct={pct} showLabel={false} /></div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
                {completedCount} / {totalCount} completed ({pct.toFixed(0)}%)
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            {totalCount > 0 && (
              <button
                onClick={handleClearLectures}
                className="sketch-btn"
                style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--hl-pink)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
              >
                Clear Lectures
              </button>
            )}
            <button
              onClick={() => setShowImport(true)}
              className="sketch-btn sketch-btn-accent"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/>
              </svg>
              Import Playlist
            </button>
          </div>
          
        </div>
      </div>

      {/* Hand-Drawn Video Player Frame */}
      {activeLecture && (
        <div 
          className="sketch-border animate-fade-in"
          style={{ 
            marginBottom: '36px', 
            background: 'var(--hl-yellow)', 
            padding: '20px 20px 30px 20px', 
            boxShadow: '5px 5px 0px var(--border)',
            borderRadius: '12px 12px 20px 20px / 12px 12px 16px 16px',
            position: 'relative'
          }}
        >
          {/* TV Monitor Base (Doodle style) */}
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '-22px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '120px', 
              height: '20px', 
              border: '2px solid var(--border)', 
              background: 'var(--bg-card)', 
              boxShadow: '2px 2px 0px var(--border)', 
              borderRadius: '4px',
              zIndex: -1
            }} 
          />
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '-8px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '60px', 
              height: '10px', 
              borderLeft: '2px solid var(--border)', 
              borderRight: '2px solid var(--border)', 
              background: 'var(--bg-card)', 
              zIndex: -1 
            }} 
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
              📺 NOW WATCHING: #{activeLecture.lecture_order + 1}. {activeLecture.title}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                onClick={handlePrevLecture} 
                disabled={lectures.findIndex(l => l.id === activeLecture.id) <= 0}
                className="sketch-btn"
                style={{ padding: '4px 10px', fontSize: '12px', background: '#ffffff' }}
              >
                ◀ Prev
              </button>
              <button 
                onClick={handleNextLecture} 
                disabled={lectures.findIndex(l => l.id === activeLecture.id) >= lectures.length - 1}
                className="sketch-btn"
                style={{ padding: '4px 10px', fontSize: '12px', background: '#ffffff' }}
              >
                Next ▶
              </button>
              <button 
                onClick={() => setActiveLecture(null)} 
                className="sketch-btn"
                style={{ padding: '4px 10px', fontSize: '12px', background: 'var(--hl-pink)', color: 'var(--red)' }}
              >
                Close ✖
              </button>
            </div>
          </div>

          {showAdTip && (
            <div 
              className="sketch-border-sm taped taped-yellow"
              style={{ 
                marginBottom: '14px', 
                padding: '10px 14px', 
                background: 'var(--hl-blue)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '12px',
                transform: 'rotate(-0.5deg)',
                boxShadow: '1.5px 1.5px 0 var(--border)'
              }}
            >
              <div style={{ fontSize: '13px', fontFamily: 'var(--hand)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.3 }}>
                <span>💡</span>
                <span>
                  <strong>Tip for Ad-Free Study:</strong> To block ads on YouTube player, install the <a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>uBlock Origin</a> extension or use Brave browser.
                </span>
              </div>
              <button onClick={handleDismissAdTip} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }} title="Dismiss">×</button>
            </div>
          )}

          {/* YouTube iframe container with thick border */}
          <div 
            style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden', 
              borderRadius: '8px', 
              border: '2.5px solid var(--border)',
              background: '#000000',
              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)'
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeLecture.video_id}?autoplay=1&rel=0`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Folder Index Tabbed Navigation */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '2px', 
          marginBottom: '2px', /* Sits flush with container border */
          background: 'transparent', 
          padding: '0 8px', 
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          zIndex: 6
        }}
      >
        <button onClick={() => setActiveTab('lectures')} className={`tab-button sketch-border-sm ${activeTab === 'lectures' ? 'active' : ''}`}>
          📚 Lectures {totalCount > 0 && `(${totalCount})`}
        </button>
        <button onClick={() => setActiveTab('plan')} className={`tab-button sketch-border-sm ${activeTab === 'plan' ? 'active' : ''}`}>
          🗓️ Study Planner
        </button>
        <button onClick={() => setActiveTab('progress')} className={`tab-button sketch-border-sm ${activeTab === 'progress' ? 'active' : ''}`}>
          📈 Progress Chart
        </button>
        <button onClick={() => setActiveTab('ai')} className={`tab-button sketch-border-sm ${activeTab === 'ai' ? 'active' : ''}`}>
          🤖 AI Assistant
        </button>
      </div>

      {/* Tab Content Panel (Notebook Page) */}
      <div 
        className="sketch-border"
        style={{ 
          background: '#ffffff', 
          padding: '28px', 
          boxShadow: '4px 4px 0px var(--border)',
          position: 'relative',
          zIndex: 5
        }}
      >
        {activeTab === 'lectures' && (
          <LectureList lectures={lectures} loading={lecturesLoading} error={lecturesError} onToggle={handleToggle} onEdit={handleEditLecture} onDelete={handleDeleteLecture} onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} pendingIds={pendingIds} onPlay={setActiveLecture} activeLectureId={activeLecture?.id} />
        )}
        {activeTab === 'plan' && (
          <StudyPlan subjectId={subjectId} lectures={lectures} subject={subject} />
        )}
        {activeTab === 'progress' && (
          progressLoading
            ? <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size={32} /></div>
            : <ProgressChart progress={progress} />
        )}
        {activeTab === 'ai' && (
          <AIAssistant subjectId={subjectId} />
        )}
      </div>

      {showImport && (
        <ImportPlaylistModal subjectId={subjectId} onClose={() => setShowImport(false)} onSuccess={() => { refetch(); refetchProgress() }} />
      )}
      {showEdit && subject && (
        <EditSubjectModal subject={subject} onClose={() => setShowEdit(false)} onSubmit={handleEditSubject} />
      )}
    </div>
  )
}
