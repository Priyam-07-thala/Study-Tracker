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
    return <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}><Spinner size={24} /></div>;
  }

  if (error) {
    return <div style={{ padding: '16px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)', borderRadius: 'var(--radius-lg)', color: 'var(--red)', fontSize: '13px' }}>{error}</div>;
  }

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercent = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '40px', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🎯</span> Daily Goals
        </h2>
        {goals.length > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '0.05em' }}>
            {completedCount} / {goals.length} COMPLETED
          </span>
        )}
      </div>

      {goals.length > 0 && (
        <div style={{ height: '5px', background: 'var(--bg-3)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--green)', width: `${progressPercent}%`, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new daily goal..."
          disabled={isSubmitting}
          style={{ flex: 1, padding: '11px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-dim)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isSubmitting}
          style={{ padding: '0 24px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: (!newTitle.trim() || isSubmitting) ? 'not-allowed' : 'pointer', opacity: (!newTitle.trim() || isSubmitting) ? 0.6 : 1, boxShadow: (!newTitle.trim() || isSubmitting) ? 'none' : 'var(--shadow-accent)', transition: 'all 0.2s' }}
          onMouseEnter={e => { if (newTitle.trim() && !isSubmitting) e.currentTarget.style.background = 'var(--accent-hover)' }}
          onMouseLeave={e => { if (newTitle.trim() && !isSubmitting) e.currentTarget.style.background = 'var(--accent)' }}
        >
          {isSubmitting ? 'Adding...' : 'Add Goal'}
        </button>
      </form>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '14px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
          No goals set for today. Add one above to kickstart your day!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goals.map(goal => (
            <div 
              key={goal.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                background: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius)', 
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', 
                ...(goal.completed ? { opacity: 0.65 } : {}) 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = goal.completed ? 'var(--border)' : 'var(--border-hover)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <div 
                onClick={() => handleToggle(goal.id, goal.completed)}
                style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${goal.completed ? 'var(--green)' : 'var(--border-hover)'}`, background: goal.completed ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
              >
                {goal.completed && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>

              {editingId === goal.id ? (
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(goal.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    style={{ flex: 1, padding: '6px 12px', background: 'var(--bg-2)', border: '1px solid var(--accent)', borderRadius: '6px', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
                  />
                  <button onClick={() => saveEdit(goal.id)} style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Save</button>
                  <button onClick={cancelEdit} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ flex: 1, fontSize: '14px', textDecoration: goal.completed ? 'line-through' : 'none', color: goal.completed ? 'var(--text-muted)' : 'var(--text)', wordBreak: 'break-word', fontWeight: goal.completed ? 400 : 500 }}>
                  {goal.title}
                </div>
              )}

              {editingId !== goal.id && (
                <div style={{ display: 'flex', gap: '8px', opacity: 0.7 }}>
                  <button onClick={() => startEdit(goal)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '13px' }} title="Edit">✎</button>
                  <button onClick={() => handleDelete(goal.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '13px' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'} title="Delete">✖</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
