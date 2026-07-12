import React, { useState } from 'react';
import { useDailyGoals } from '../hooks/useDailyGoals';
import Spinner from './Spinner';

export default function DailyGoals() {
  const { goals, loading, error, addGoal, updateGoal, deleteGoal } = useDailyGoals();
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setIsSubmitting(true);
      await addGoal(newTitle.trim());
      setNewTitle('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await updateGoal(id, { completed: !currentStatus });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await deleteGoal(id);
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await updateGoal(id, { title: editTitle.trim() });
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="sticky-note taped" 
        style={{ background: 'var(--hl-pink)', color: 'var(--red)', fontSize: '14px', fontWeight: 'bold' }}
      >
        ⚠️ {error}
      </div>
    );
  }

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercent = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div 
      className="sketch-border"
      style={{ 
        background: '#fffde6', /* Legal pad yellow */
        padding: '24px', 
        marginBottom: '32px', 
        boxShadow: '4px 4px 0px var(--border)',
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(44, 42, 41, 0.05) 1px, transparent 1px)',
        backgroundSize: '100% 32px',
        lineHeight: '32px'
      }}
    >
      {/* Decorative vertical red line of legal pad */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '48px', 
          top: 0, 
          bottom: 0, 
          width: '2px', 
          background: 'rgba(239, 68, 68, 0.35)', 
          pointerEvents: 'none' 
        }} 
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', zIndex: 5, position: 'relative' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
          🎯 Daily Study Goals
        </h2>
        {goals.length > 0 && (
          <span 
            style={{ 
              fontSize: '13px', 
              color: 'var(--text-muted)', 
              fontFamily: 'var(--hand)', 
              fontWeight: 'bold', 
              letterSpacing: '0.02em', 
              background: 'var(--hl-yellow)', 
              padding: '2px 8px', 
              borderRadius: '4px',
              border: '1.5px solid var(--border)'
            }}
          >
            {completedCount} / {goals.length} COMPLETED
          </span>
        )}
      </div>

      {/* Highlighter-style progress bar */}
      {goals.length > 0 && (
        <div 
          style={{ 
            height: '10px', 
            background: 'rgba(0,0,0,0.06)', 
            borderRadius: '10px 4px 8px 6px / 6px 4px 10px 8px', 
            border: '2px solid var(--border)',
            marginBottom: '20px', 
            overflow: 'hidden',
            position: 'relative',
            zIndex: 5
          }}
        >
          <div 
            style={{ 
              height: '100%', 
              background: 'var(--hl-green)', 
              width: `${progressPercent}%`, 
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
            }} 
          />
        </div>
      )}

      {/* Input Form styled as writing on pad */}
      <form 
        onSubmit={handleAdd} 
        style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px', 
          position: 'relative', 
          zIndex: 5,
          paddingLeft: '32px' 
        }}
      >
        <input
          type="text"
          className="sketch-input"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Write down a micro-goal for today..."
          disabled={isSubmitting}
          style={{ flex: 1, padding: '4px 0', lineHeight: 1 }}
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isSubmitting}
          className="sketch-btn sketch-btn-accent"
          style={{ padding: '6px 16px', alignSelf: 'flex-end', height: '36px' }}
        >
          {isSubmitting ? 'Adding...' : 'Add Goal ✏️'}
        </button>
      </form>

      {goals.length === 0 ? (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '30px 20px', 
            color: 'var(--text-muted)', 
            fontFamily: 'var(--hand)', 
            fontWeight: 'bold',
            fontSize: '16px', 
            border: '2px dashed var(--border)', 
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.4)',
            marginLeft: '32px',
            position: 'relative',
            zIndex: 5
          }}
        >
          Your list is empty! Add a daily task above to kickstart your study session.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '32px', position: 'relative', zIndex: 5 }}>
          {goals.map(goal => (
            <div 
              key={goal.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '14px', 
                padding: '4px 0', 
                transition: 'all 0.2s', 
                ...(goal.completed ? { opacity: 0.7 } : {}) 
              }}
            >
              {/* Sketchy checkbox */}
              <div 
                onClick={() => handleToggle(goal.id, goal.completed)}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2.5px solid var(--border)', 
                  borderRadius: '6px 4px 7px 5px / 5px 6px 4px 7px',
                  background: goal.completed ? 'var(--hl-green)' : '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  flexShrink: 0, 
                  boxShadow: '1px 1px 0px var(--border)'
                }}
              >
                {goal.completed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ overflow: 'visible' }}>
                    <path 
                      d="M2.5 5.5l3 3.5 5-7.5" 
                      stroke="var(--green)" 
                      strokeWidth="2.5" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {editingId === goal.id ? (
                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    className="sketch-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(goal.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    style={{ flex: 1, padding: '2px 0' }}
                  />
                  <button onClick={() => saveEdit(goal.id)} className="sketch-btn" style={{ padding: '4px 10px', fontSize: '12px', background: 'var(--hl-green)' }}>Save</button>
                  <button onClick={cancelEdit} className="sketch-btn" style={{ padding: '4px 10px', fontSize: '12px' }}>Cancel</button>
                </div>
              ) : (
                <div 
                  style={{ 
                    flex: 1, 
                    fontSize: '17px', 
                    fontFamily: 'var(--hand)',
                    fontWeight: 'bold',
                    textDecoration: goal.completed ? 'line-through' : 'none', 
                    color: goal.completed ? 'var(--text-muted)' : 'var(--text)', 
                    wordBreak: 'break-word',
                    lineHeight: '24px'
                  }}
                >
                  {goal.title}
                </div>
              )}

              {editingId !== goal.id && (
                <div style={{ display: 'flex', gap: '8px', opacity: 0.7 }}>
                  <button 
                    onClick={() => startEdit(goal)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }} 
                    title="Edit Task"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => handleDelete(goal.id)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }} 
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} 
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'} 
                    title="Delete Task"
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
