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

  const handleDeleteLecture = async (lectureId) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try { await removeLectureAction(lectureId); refetchProgress() }
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

  const tabStyle = (tab) => ({
    padding: '8px 18px', fontSize: '13px', fontWeight: 500,
    background: activeTab === tab ? 'var(--bg-3)' : 'transparent',
    border: '1px solid', borderColor: activeTab === tab ? 'var(--border-hover)' : 'transparent',
    borderRadius: 'var(--radius)', color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
    cursor: 'pointer', transition: 'all 0.15s',
  })

  if (subjectLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size={36} /></div>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {subject?.name || `Subject #${subjectId}`}
                {subject?.is_paused && <span style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--bg-3)', color: 'var(--text-muted)', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Paused</span>}
              </h1>
              {subject?.is_paused ? (
                <button onClick={handlePauseToggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--green)' }} title="Resume Subject">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
              ) : (
                <button onClick={handlePauseToggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Pause Subject">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>
              )}
              <button onClick={() => setShowEdit(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Edit Subject">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button onClick={handleDeleteSubject} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Delete Subject">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            {subject?.description && <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{subject.description}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, maxWidth: '300px' }}><ProgressBar pct={pct} /></div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{completedCount} / {totalCount} lectures</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {totalCount > 0 && (
              <button
                onClick={handleClearLectures}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '13px', fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
              >
                Clear Lectures
              </button>
            )}
            <button
              onClick={() => setShowImport(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '13px', fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/>
              </svg>
              Import Playlist
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('lectures')} style={tabStyle('lectures')}>Lectures {totalCount > 0 && `(${totalCount})`}</button>
        <button onClick={() => setActiveTab('plan')} style={tabStyle('plan')}>Study Plan</button>
        <button onClick={() => setActiveTab('progress')} style={tabStyle('progress')}>Progress Chart</button>
        <button onClick={() => setActiveTab('ai')} style={tabStyle('ai')}>AI Assistant</button>
      </div>

      {activeTab === 'lectures' && (
        <LectureList lectures={lectures} loading={lecturesLoading} error={lecturesError} onToggle={handleToggle} onEdit={handleEditLecture} onDelete={handleDeleteLecture} onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} pendingIds={pendingIds} />
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

      {showImport && (
        <ImportPlaylistModal subjectId={subjectId} onClose={() => setShowImport(false)} onSuccess={() => { refetch(); refetchProgress() }} />
      )}
      {showEdit && subject && (
        <EditSubjectModal subject={subject} onClose={() => setShowEdit(false)} onSubmit={handleEditSubject} />
      )}
    </div>
  )
}
