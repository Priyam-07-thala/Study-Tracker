import React, { useState, useEffect } from 'react'
import { generatePlan, getPlan, getPlanStatus, adjustPlan } from '../api/plan'
import Spinner from './Spinner'

function formatDuration(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function StudyPlan({ subjectId, lectures, subject }) {
  const [plan, setPlan] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hoursInput, setHoursInput] = useState(2)
  const [calcMode, setCalcMode] = useState('hours')
  const [daysInput, setDaysInput] = useState(7)
  const [generating, setGenerating] = useState(false)

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const p = await getPlan(subjectId)
      setPlan(p)
      if (p) {
        const s = await getPlanStatus(subjectId)
        setStatus(s)
      }
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        setPlan(null)
      } else {
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [subjectId, lectures])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const payload = calcMode === 'days' 
        ? { target_days: daysInput || 1 }
        : { hours_per_day: hoursInput || 2 }
      
      await generatePlan(subjectId, payload)
      await fetchPlan()
    } catch (err) {
      alert('Failed to generate plan: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleAdjust = async () => {
    try {
      setGenerating(true)
      await adjustPlan(subjectId)
      await fetchPlan()
    } catch (err) {
      alert('Failed to adjust plan: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size={32} /></div>
  }

  if (!plan) {
    const totalSecs = lectures.reduce((a, l) => a + (l.duration || 0), 0)
    const totalHrs = (totalSecs / 3600).toFixed(1)
    
    return (
      <div 
        className="sketch-border"
        style={{ 
          padding: '32px', 
          background: 'var(--hl-orange)', 
          textAlign: 'center',
          boxShadow: '3px 3px 0px var(--border)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', fontFamily: 'var(--sans)' }}>
          No Study Plan Scheduled Yet! 🗓️
        </h3>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold', fontSize: '16px', marginBottom: '24px' }}>
          Let Doodly generate a customized daily timeline to help you finish this course.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          
          {/* Mode Switcher */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '6px', 
              background: '#ffffff', 
              padding: '3px', 
              borderRadius: '6px', 
              border: '2px solid var(--border)' 
            }}
          >
            <button 
              onClick={() => setCalcMode('hours')}
              className="sketch-btn"
              style={{ 
                padding: '4px 10px', 
                fontSize: '13px', 
                background: calcMode === 'hours' ? 'var(--hl-yellow)' : 'transparent',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              Target Hours/Day
            </button>
            <button 
              onClick={() => setCalcMode('days')}
              className="sketch-btn"
              style={{ 
                padding: '4px 10px', 
                fontSize: '13px', 
                background: calcMode === 'days' ? 'var(--hl-yellow)' : 'transparent',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              Target Days count
            </button>
          </div>

          {/* Calculator options */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {calcMode === 'hours' ? (
              <>
                <label style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'var(--hand)' }}>Hours per day:</label>
                <input
                  type="number"
                  value={hoursInput}
                  onChange={e => setHoursInput(parseFloat(e.target.value))}
                  step="0.5"
                  min="0.5"
                  className="sketch-input"
                  style={{ width: '60px', padding: '2px', textAlign: 'center' }}
                />
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'var(--hand)' }}>Total target days:</label>
                <input
                  type="number"
                  value={daysInput}
                  onChange={e => setDaysInput(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  className="sketch-input"
                  style={{ width: '60px', padding: '2px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
                  (~{(totalHrs / (daysInput || 1)).toFixed(1)} hrs/day)
                </span>
              </div>
            )}
            
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="sketch-btn sketch-btn-accent"
              style={{ padding: '8px 16px' }}
            >
              {generating ? 'Generating...' : 'Generate Plan 🚀'}
            </button>
          </div>
          
        </div>
      </div>
    )
  }

  const effectiveDate = subject?.is_paused && subject?.paused_at 
    ? new Date(subject.paused_at) 
    : new Date()
  const daysPassed = Math.max(1, Math.floor((effectiveDate - new Date(plan.start_date)) / (1000 * 60 * 60 * 24)) + 1)
  const todaysPlan = plan.days.find(d => d.day_number === daysPassed)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Paused Banner */}
      {subject?.is_paused && (
        <div 
          className="sticky-note taped taped-yellow" 
          style={{ 
            background: 'var(--hl-orange)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            transform: 'rotate(-0.5deg)'
          }}
        >
          <span style={{ fontSize: '24px' }}>⏸️</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--sans)' }}>Plan is Paused</h3>
            <p style={{ fontSize: '14px', fontFamily: 'var(--hand)', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              Daily scheduler will remain frozen. Resuming the subject will automatically slide calendar dates forward.
            </p>
          </div>
        </div>
      )}

      {/* Status Taped Note Alert */}
      {status && !subject?.is_paused && (
        <div 
          className="sticky-note taped"
          style={{ 
            display: 'flex', 
            gap: '16px', 
            background: status.status === 'ahead' ? 'var(--hl-green)' : status.status === 'behind' ? 'var(--hl-pink)' : 'var(--hl-yellow)',
            transform: status.status === 'behind' ? 'rotate(-1deg)' : 'rotate(1deg)',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', fontFamily: 'var(--sans)' }}>
              {status.status === 'ahead' && <span style={{ color: 'var(--green)' }}>● You are ahead of schedule! 🎉</span>}
              {status.status === 'behind' && <span style={{ color: 'var(--red)' }}>● You are behind schedule! ⚠️</span>}
              {status.status === 'on_track' && <span style={{ color: 'var(--text)' }}>● You are fully on track! 👍</span>}
            </h3>
            <p style={{ fontSize: '14px', fontFamily: 'var(--hand)', fontWeight: 'bold', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {status.status !== 'on_track' && `Deviation: ${status.deviation_minutes} minutes from plan line. `}
              Study velocity: {status.avg_time_per_day_minutes} mins/day.
            </p>
            {status.estimated_completion_date && (
              <p style={{ fontSize: '14px', fontFamily: 'var(--hand)', fontWeight: 'bold', color: 'var(--text)', marginTop: '2px' }}>
                Estimated Completion: <strong>{new Date(status.estimated_completion_date).toLocaleDateString()}</strong>
              </p>
            )}
          </div>
          
          {status.status === 'behind' && (
            <button 
              onClick={handleAdjust} 
              disabled={generating} 
              className="sketch-btn"
              style={{ background: '#ffffff', color: 'var(--red)', borderColor: 'var(--red)' }}
            >
              {generating ? 'Adjusting...' : 'Adjust Schedule ⚙️'}
            </button>
          )}
        </div>
      )}

      {/* Today's Tasks */}
      {todaysPlan && (
        <div 
          className="sketch-border-sm"
          style={{ 
            background: 'var(--hl-blue)', 
            padding: '20px', 
            boxShadow: '3px 3px 0 var(--border)',
            transform: 'rotate(-0.5deg)'
          }}
        >
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px', fontFamily: 'var(--sans)' }}>
            📌 TODAY'S STUDY ASSIGNMENT (Day {daysPassed})
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {todaysPlan.lecture_ids.map(lId => {
              const lec = lectures.find(l => l.id === lId)
              if (!lec) return null
              return (
                <div 
                  key={lId} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    background: '#ffffff', 
                    border: '1.5px solid var(--border)', 
                    borderRadius: '6px',
                    opacity: lec.completed ? 0.6 : 1 
                  }}
                >
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        textDecoration: lec.completed ? 'line-through' : 'none' 
                      }}
                    >
                      {lec.lecture_order + 1}. {lec.title}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '12px', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
                    {formatDuration(lec.duration)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full Plan Breakdown Section */}
      <div 
        className="sketch-border-sm"
        style={{ 
          padding: '24px', 
          background: 'var(--bg-card)', 
          border: '2px solid var(--border)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--sans)' }}>
            🗓️ Full Workbook Timeline
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div 
              style={{ 
                display: 'flex', 
                gap: '2px', 
                background: 'var(--bg)', 
                padding: '2px', 
                borderRadius: '6px', 
                border: '2.5px solid var(--border)' 
              }}
            >
              <button 
                onClick={() => setCalcMode('hours')}
                style={{ 
                  padding: '3px 8px', 
                  border: 'none', 
                  background: calcMode === 'hours' ? 'var(--hl-yellow)' : 'transparent', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  fontFamily: 'var(--sans)' 
                }}
              >
                Hours/Day
              </button>
              <button 
                onClick={() => setCalcMode('days')}
                style={{ 
                  padding: '3px 8px', 
                  border: 'none', 
                  background: calcMode === 'days' ? 'var(--hl-yellow)' : 'transparent', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  fontFamily: 'var(--sans)' 
                }}
              >
                Days
              </button>
            </div>

            {calcMode === 'hours' ? (
              <input
                type="number"
                value={hoursInput}
                onChange={e => setHoursInput(parseFloat(e.target.value))}
                step="0.5"
                min="0.5"
                className="sketch-input"
                style={{ width: '50px', padding: '2px', textAlign: 'center', fontSize: '13px' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  value={daysInput}
                  onChange={e => setDaysInput(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  className="sketch-input"
                  style={{ width: '50px', padding: '2px', textAlign: 'center', fontSize: '13px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
                  (~{((lectures.reduce((a, l) => a + (l.duration || 0), 0) / 3600) / (daysInput || 1)).toFixed(1)} h/d)
                </span>
              </div>
            )}

            <button 
              onClick={handleGenerate} 
              disabled={generating} 
              className="sketch-btn"
              style={{ padding: '4px 10px', fontSize: '12px', background: 'var(--hl-yellow)' }}
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </div>
        
        {/* Days timeline map */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {plan.days.map(day => (
            <div 
              key={day.day_number} 
              className="sketch-border-sm"
              style={{ 
                background: day.day_number === daysPassed ? 'var(--hl-blue)' : 'var(--bg)', 
                padding: '16px', 
                border: '2px solid var(--border)',
                boxShadow: day.day_number === daysPassed ? '2.5px 2.5px 0 var(--border)' : '1px 1px 0 var(--border)',
                transform: day.day_number === daysPassed ? 'rotate(1.5deg)' : 'none'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '10px', 
                  paddingBottom: '4px', 
                  borderBottom: '1.5px dashed var(--border)' 
                }}
              >
                <strong style={{ fontSize: '14px', fontFamily: 'var(--sans)' }}>Day {day.day_number}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--hand)', fontWeight: 'bold' }}>
                  {formatDuration(day.total_duration)}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {day.lecture_ids.map(lId => {
                  const lec = lectures.find(l => l.id === lId)
                  if (!lec) return null
                  return (
                    <div 
                      key={lId} 
                      style={{ 
                        fontSize: '13px', 
                        fontFamily: 'var(--hand)',
                        fontWeight: 'bold',
                        color: lec.completed ? 'var(--text-muted)' : 'var(--text)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}
                    >
                      {lec.completed ? '✓ ' : '○ '}{lec.title}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}
