import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LectureList from '../components/LectureList'
import ImportPlaylistModal from '../components/ImportPlaylistModal'
import ProgressChart from '../components/ProgressChart'
import ProgressBar from '../components/ProgressBar'
import Spinner from '../components/Spinner'
import { useLectures } from '../hooks/useLectures'
import { useProgress } from '../hooks/useProgress'
import { getSubjects } from '../api/subjects'

export default function SubjectPage() {
  const { id } = useParams()
  const subjectId = parseInt(id)
  const [subject, setSubject] = useState(null)
  const [subjectLoading, setSubjectLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [activeTab, setActiveTab] = useState('lectures')

  const { lectures, loading: lecturesLoading, error: lecturesError, refetch, toggleLecture, pendingIds } = useLectures(subjectId)
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
            <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>{subject?.name || `Subject #${subjectId}`}</h1>
            {subject?.description && <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{subject.description}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, maxWidth: '300px' }}><ProgressBar pct={pct} /></div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{completedCount} / {totalCount} lectures</span>
            </div>
          </div>
          <button
            onClick={() => setShowImport(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '13px', fontWeight: 500, flexShrink: 0 }}
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('lectures')} style={tabStyle('lectures')}>Lectures {totalCount > 0 && `(${totalCount})`}</button>
        <button onClick={() => setActiveTab('progress')} style={tabStyle('progress')}>Progress Chart</button>
      </div>

      {activeTab === 'lectures' && (
        <LectureList lectures={lectures} loading={lecturesLoading} error={lecturesError} onToggle={handleToggle} pendingIds={pendingIds} />
      )}
      {activeTab === 'progress' && (
        progressLoading
          ? <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size={32} /></div>
          : <ProgressChart progress={progress} />
      )}

      {showImport && (
        <ImportPlaylistModal subjectId={subjectId} onClose={() => setShowImport(false)} onSuccess={() => { refetch(); refetchProgress() }} />
      )}
    </div>
  )
}
