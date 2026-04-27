import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--mono)', fontSize: '11px' }}>{formatDate(label)}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{payload[0].value?.toFixed(1)}% complete</div>
    </div>
  )
}

export default function ProgressChart({ progress }) {
  if (!progress || !progress.snapshots?.length) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        No progress history yet. Mark some lectures complete to see the chart.
      </div>
    )
  }

  const data = progress.snapshots.map(s => ({ date: s.snapshot_date, pct: s.completion_percentage }))

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>PROGRESS OVER TIME</div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{progress.current_completion?.toFixed(1)}%</div>
        </div>
        {progress.predicted_completion_date && (
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 'var(--radius)', padding: '10px 14px', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', marginBottom: '2px' }}>EST. COMPLETION</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>{formatDate(progress.predicted_completion_date)}</div>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--mono)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke="var(--green)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Area type="monotone" dataKey="pct" stroke="#7c6af7" strokeWidth={2} fill="url(#progressGrad)" dot={{ fill: '#7c6af7', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#9585ff', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
