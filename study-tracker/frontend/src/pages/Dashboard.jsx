import React, { useState } from 'react'
import SubjectCard from '../components/SubjectCard'
import CreateSubjectModal from '../components/CreateSubjectModal'
import EditSubjectModal from '../components/EditSubjectModal'
import Spinner from '../components/Spinner'
import { useSubjects } from '../hooks/useSubjects'

export default function Dashboard() {
  const { subjects, loading, error, addSubject, editSubjectAction, removeSubjectAction, pauseSubjectAction, resumeSubjectAction } = useSubjects()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? All associated lectures and progress will be lost.')) {
      try { await removeSubjectAction(id) }
      catch (err) { alert('Failed to delete: ' + err.message) }
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Dashboard</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Track your learning progress across all subjects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Subject
        </button>
      </div>

      {!loading && subjects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'TOTAL SUBJECTS', value: subjects.length },
            { label: 'TOTAL LECTURES', value: subjects.reduce((a, s) => a + s.total_lectures, 0) },
            { label: 'COMPLETED', value: subjects.reduce((a, s) => a + s.completed_lectures, 0) },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', marginBottom: '6px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size={36} /></div>
      ) : error ? (
        <div style={{ padding: '24px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)', borderRadius: 'var(--radius-lg)', color: 'var(--red)', fontSize: '14px' }}>{error}</div>
      ) : subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📚</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No subjects yet</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Create your first subject and import a YouTube playlist</div>
          <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 500 }}>Create Subject</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {subjects.map((s, i) => (
            <SubjectCard 
              key={s.id} 
              subject={s} 
              index={i} 
              onEditRequest={() => setEditingSubject(s)} 
              onDeleteRequest={() => handleDelete(s.id)} 
              onPauseRequest={() => pauseSubjectAction(s.id)}
              onResumeRequest={() => resumeSubjectAction(s.id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && <CreateSubjectModal onClose={() => setShowCreateModal(false)} onSubmit={addSubject} />}
      {editingSubject && <EditSubjectModal subject={editingSubject} onClose={() => setEditingSubject(null)} onSubmit={editSubjectAction} />}
    </div>
  )
}
