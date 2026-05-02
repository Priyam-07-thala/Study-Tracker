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

export default function StudyPlan({ subjectId, lectures }) {
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
  }, [subjectId])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const totalDurationSecs = lectures.reduce((acc, l) => acc + (l.duration || 0), 0)
      let finalHours = hoursInput
      if (calcMode === 'days') {
        const days = daysInput || 1
        finalHours = (totalDurationSecs / 3600) / days
        if (finalHours <= 0) finalHours = 0.5
      }
      await generatePlan(subjectId, finalHours)
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
    return (
      <div style={{ padding: '32px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Study Plan Yet</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Generate a smart study plan based on video durations to stay on track.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setCalcMode('hours')}
              style={{ padding: '6px 12px', border: 'none', background: calcMode === 'hours' ? 'var(--bg-2)' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: calcMode === 'hours' ? 600 : 400, color: 'var(--text)' }}
            >
              Target Hours/Day
            </button>
            <button 
              onClick={() => setCalcMode('days')}
              style={{ padding: '6px 12px', border: 'none', background: calcMode === 'days' ? 'var(--bg-2)' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: calcMode === 'days' ? 600 : 400, color: 'var(--text)' }}
            >
              Target Days
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {calcMode === 'hours' ? (
              <>
                <label style={{ fontSize: '14px' }}>Hours per day:</label>
                <input
                  type="number"
                  value={hoursInput}
                  onChange={e => setHoursInput(parseFloat(e.target.value))}
                  step="0.5"
                  min="0.5"
                  style={{ padding: '8px', width: '80px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                />
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px' }}>Total days:</label>
                <input
                  type="number"
                  value={daysInput}
                  onChange={e => setDaysInput(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  style={{ padding: '8px', width: '80px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)' }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  (~{((lectures.reduce((a, l) => a + (l.duration || 0), 0) / 3600) / (daysInput || 1)).toFixed(1)} h/day)
                </span>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              {generating ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Find today's tasks
  const daysPassed = Math.max(1, Math.floor((new Date() - new Date(plan.start_date)) / (1000 * 60 * 60 * 24)) + 1)
  const todaysPlan = plan.days.find(d => d.day_number === daysPassed)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Status Banner */}
      {status && (
        <div style={{ 
          display: 'flex', gap: '16px', padding: '16px', borderRadius: 'var(--radius)', 
          background: status.status === 'ahead' ? 'rgba(46, 204, 113, 0.1)' : status.status === 'behind' ? 'rgba(231, 76, 60, 0.1)' : 'var(--bg-2)',
          border: `1px solid ${status.status === 'ahead' ? 'rgba(46, 204, 113, 0.3)' : status.status === 'behind' ? 'rgba(231, 76, 60, 0.3)' : 'var(--border)'}`
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {status.status === 'ahead' && <span style={{ color: '#2ecc71' }}>● You are ahead of schedule</span>}
              {status.status === 'behind' && <span style={{ color: '#e74c3c' }}>● You are behind schedule</span>}
              {status.status === 'on_track' && <span style={{ color: 'var(--accent)' }}>● You are on track</span>}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {status.status !== 'on_track' && `Deviation: ${status.deviation_minutes} minutes.`}
              Average speed: {status.avg_time_per_day_minutes} mins/day.
            </p>
            {status.estimated_completion_date && (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Estimated completion: <strong>{new Date(status.estimated_completion_date).toLocaleDateString()}</strong>
              </p>
            )}
          </div>
          {status.status === 'behind' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={handleAdjust} disabled={generating} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                {generating ? 'Adjusting...' : 'Adjust Plan'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Today's Tasks */}
      {todaysPlan && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Today's Tasks (Day {daysPassed})</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {todaysPlan.lecture_ids.map(lId => {
              const lec = lectures.find(l => l.id === lId)
              if (!lec) return null
              return (
                <div key={lId} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', opacity: lec.completed ? 0.6 : 1 }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: lec.completed ? 'line-through' : 'none' }}>
                      {lec.lecture_order}. {lec.title}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '16px' }}>
                    {formatDuration(lec.duration)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full Plan Breakdown */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Full Plan Breakdown</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setCalcMode('hours')}
                style={{ padding: '4px 8px', border: 'none', background: calcMode === 'hours' ? 'var(--bg-2)' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: calcMode === 'hours' ? 600 : 400, color: 'var(--text)' }}
              >
                Hours/Day
              </button>
              <button 
                onClick={() => setCalcMode('days')}
                style={{ padding: '4px 8px', border: 'none', background: calcMode === 'days' ? 'var(--bg-2)' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: calcMode === 'days' ? 600 : 400, color: 'var(--text)' }}
              >
                Target Days
              </button>
            </div>

            {calcMode === 'hours' ? (
              <input
                type="number"
                value={hoursInput}
                onChange={e => setHoursInput(parseFloat(e.target.value))}
                step="0.5"
                min="0.5"
                style={{ padding: '4px 8px', width: '60px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontSize: '13px' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  value={daysInput}
                  onChange={e => setDaysInput(parseInt(e.target.value) || 1)}
                  step="1"
                  min="1"
                  style={{ padding: '4px 8px', width: '60px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontSize: '13px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  (~{((lectures.reduce((a, l) => a + (l.duration || 0), 0) / 3600) / (daysInput || 1)).toFixed(1)} h/d)
                </span>
              </div>
            )}

            <button onClick={handleGenerate} disabled={generating} style={{ fontSize: '13px', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
              {generating ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {plan.days.map(day => (
            <div key={day.day_number} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '14px' }}>Day {day.day_number}</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDuration(day.total_duration)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {day.lecture_ids.map(lId => {
                  const lec = lectures.find(l => l.id === lId)
                  if (!lec) return null
                  return (
                    <div key={lId} style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lec.completed ? '✓ ' : '○ '}{lec.lecture_order}. {lec.title}
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
