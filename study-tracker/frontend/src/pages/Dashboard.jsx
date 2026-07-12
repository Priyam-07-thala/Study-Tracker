import React, { useState } from 'react'
import SubjectCard from '../components/SubjectCard'
import CreateSubjectModal from '../components/CreateSubjectModal'
import EditSubjectModal from '../components/EditSubjectModal'
import Spinner from '../components/Spinner'
import DailyGoals from '../components/DailyGoals'
import Mascot from '../components/Mascot'
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

  // Dynamic mascot message based on progress
  const totalLectures = subjects.reduce((a, s) => a + s.total_lectures, 0)
  const completedLectures = subjects.reduce((a, s) => a + s.completed_lectures, 0)
  
  let mascotMessage = "Welcome to your study workbook! Let's schedule some study time! 📒"
  if (subjects.length === 0) {
    mascotMessage = "Hi there! Let's start by clicking 'New Subject' to create a workspace and import a playlist! 📚"
  } else if (totalLectures > 0) {
    const pct = Math.round((completedLectures / totalLectures) * 100)
    if (pct >= 100) {
      mascotMessage = "Oh my goodness, you've completed ALL your lectures! You are a superstar study champion! 🏆✨"
    } else if (pct > 50) {
      mascotMessage = `You are ${pct}% through your active studies! Over halfway there, Doodly is super proud of you! 💪`
    } else if (pct > 0) {
      mascotMessage = `Awesome start! You have crossed off ${completedLectures} lectures. Keep taking those sketchy notes! ✍️`
    } else {
      mascotMessage = `You have ${subjects.length} subjects lined up. Open one to start learning and tracking! 🎯`
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '10px 0' }}>
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--sans)' }}>
            Study Dashboard 📈
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
            sketching out your learning schedule day by day
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="sketch-btn sketch-btn-accent"
          style={{ fontSize: '15px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Subject
        </button>
      </div>

      {/* Mascot Speech Bubble */}
      <Mascot message={mascotMessage} />

      {/* Daily To-Do Goals */}
      <DailyGoals />

      {/* Statistics Sticky Notes */}
      {!loading && subjects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px', marginBottom: '40px', marginTop: '16px' }}>
          {[
            { label: '★ TOTAL SUBJECTS', value: subjects.length, bg: 'var(--hl-yellow)', rotate: '-1deg' },
            { label: '★ TOTAL LECTURES', value: totalLectures, bg: 'var(--hl-blue)', rotate: '1.2deg' },
            { label: '★ COMPLETED LECTURES', value: completedLectures, bg: 'var(--hl-green)', rotate: '-1.5deg' },
          ].map(stat => (
            <div 
              key={stat.label} 
              className="sticky-note taped"
              style={{ 
                background: stat.bg, 
                transform: `rotate(${stat.rotate})`,
                textAlign: 'center',
                padding: '24px 16px'
              }}
            >
              <div 
                style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-muted)', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  fontFamily: 'var(--sans)' 
                }}
              >
                {stat.label}
              </div>
              <div 
                style={{ 
                  fontSize: '36px', 
                  fontWeight: 800, 
                  fontFamily: 'var(--marker)', 
                  color: 'var(--text)' 
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main content grid */}
      <div style={{ marginTop: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px', borderBottom: '2px dashed var(--border)', paddingBottom: '8px' }}>
          My Subjects 📚
        </h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Spinner size={36} />
          </div>
        ) : error ? (
          <div 
            className="sticky-note taped" 
            style={{ background: 'var(--hl-pink)', color: 'var(--red)', fontSize: '15px', fontWeight: 'bold' }}
          >
            ⚠️ {error}
          </div>
        ) : subjects.length === 0 ? (
          <div 
            className="sketch-border" 
            style={{ 
              textAlign: 'center', 
              padding: '60px 24px', 
              background: 'var(--bg-card)', 
              boxShadow: '4px 4px 0px var(--border)' 
            }}
          >
            <div style={{ fontSize: '50px', marginBottom: '16px' }}>✏️</div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Study Subjects Yet!</div>
            <div style={{ fontSize: '15px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold', marginBottom: '24px' }}>
              Create your first subject and import a YouTube learning playlist to get started.
            </div>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="sketch-btn sketch-btn-accent"
            >
              Create Subject
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
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
      </div>

      {showCreateModal && <CreateSubjectModal onClose={() => setShowCreateModal(false)} onSubmit={addSubject} />}
      {editingSubject && <EditSubjectModal subject={editingSubject} onClose={() => setEditingSubject(null)} onSubmit={editSubjectAction} />}
    </div>
  )
}
