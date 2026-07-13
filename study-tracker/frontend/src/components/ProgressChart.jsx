import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div 
      className="sketch-border"
      style={{ 
        background: 'var(--hl-yellow)', 
        boxShadow: '3px 3px 0px var(--border)',
        padding: '10px 14px', 
        fontSize: '14px',
        fontFamily: 'var(--hand)',
        fontWeight: 'bold',
        transform: 'rotate(1deg)'
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '12px' }}>
        {formatDate(label)}
      </div>
      <div style={{ color: 'var(--accent)' }}>
        {payload[0].value?.toFixed(1)}% complete 📝
      </div>
    </div>
  )
}

export default function ProgressChart({ progress }) {
  if (!progress || !progress.snapshots?.length) {
    return (
      <div 
        className="sketch-border"
        style={{ 
          padding: '48px 24px', 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          fontFamily: 'var(--hand)',
          fontWeight: 'bold',
          fontSize: '16px', 
          background: 'var(--bg-card)',
          boxShadow: '3px 3px 0px var(--border)'
        }}
      >
        No progress history recorded yet! Check off some lectures to plot your chart.
      </div>
    )
  }

  const data = progress.snapshots.map(s => ({ date: s.snapshot_date, pct: s.completion_percentage }))

  return (
    <div 
      className="sketch-border"
      style={{ 
        background: '#ffffff', 
        backgroundImage: 'linear-gradient(rgba(44, 42, 41, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 42, 41, 0.03) 1px, transparent 1px)',
        backgroundSize: '15px 15px',
        padding: '28px',
        boxShadow: '4px 4px 0px var(--border)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', fontFamily: 'var(--sans)' }}>
            PROGRESS VELOCITY 📈
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--marker)', color: 'var(--accent)', marginTop: '4px' }}>
            {progress.current_completion?.toFixed(1)}%
          </div>
        </div>
        
        {progress.predicted_completion_date && (
          <div 
            className="taped taped-yellow"
            style={{ 
              background: 'var(--hl-pink)', 
              border: '2px solid var(--border)', 
              borderRadius: '8px', 
              padding: '10px 14px', 
              boxShadow: '2px 2px 0px var(--border)',
              transform: 'rotate(2deg)'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', fontFamily: 'var(--sans)' }}>
              EST. COMPLETION 🏁
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'var(--hand)', color: 'var(--text)', marginTop: '2px' }}>
              {formatDate(progress.predicted_completion_date)}
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            {/* Highlighter gradient */}
            <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--hand)', fontWeight: 'bold' }} 
            axisLine={{ stroke: 'var(--border)', strokeWidth: 2 }} 
            tickLine={false} 
          />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={v => `${v}%`} 
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--hand)', fontWeight: 'bold' }} 
            axisLine={{ stroke: 'var(--border)', strokeWidth: 2 }} 
            tickLine={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={100} 
            stroke="var(--green)" 
            strokeDasharray="4 4" 
            strokeWidth={2}
          />
          
          <Area 
            type="monotone" 
            dataKey="pct" 
            stroke="var(--border)" 
            strokeWidth={3} 
            fill="url(#progressGrad)" 
            dot={{ fill: 'var(--accent)', stroke: 'var(--border)', strokeWidth: 2, r: 4 }} 
            activeDot={{ r: 6, fill: 'var(--hl-yellow)', stroke: 'var(--border)', strokeWidth: 2.5 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
