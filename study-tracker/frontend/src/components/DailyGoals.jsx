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
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎯</span> Daily Goals
        </h2>
        {goals.length > 0 && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
            {completedCount} / {goals.length} COMPLETED
          </span>
        )}
      </div>

      {goals.length > 0 && (
        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--green)', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new daily goal..."
          disabled={isSubmitting}
          style={{ flex: 1, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isSubmitting}
          style={{ padding: '0 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: (!newTitle.trim() || isSubmitting) ? 'not-allowed' : 'pointer', opacity: (!newTitle.trim() || isSubmitting) ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Adding...' : 'Add Goal'}
        </button>
      </form>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '14px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
          No goals set for today. Add one above!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goals.map(goal => (
            <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', transition: 'border-color 0.2s', ...(goal.completed ? { opacity: 0.7 } : {}) }}>
              <div 
                onClick={() => handleToggle(goal.id, goal.completed)}
                style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${goal.completed ? 'var(--green)' : 'var(--border-2)'}`, background: goal.completed ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                {goal.completed && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
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
                    style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-2)', border: '1px solid var(--accent)', borderRadius: '4px', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
                  />
                  <button onClick={() => saveEdit(goal.id)} style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Save</button>
                  <button onClick={cancelEdit} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ flex: 1, fontSize: '14px', textDecoration: goal.completed ? 'line-through' : 'none', color: goal.completed ? 'var(--text-muted)' : 'var(--text)', wordBreak: 'break-word' }}>
                  {goal.title}
                </div>
              )}

              {editingId !== goal.id && (
                <div style={{ display: 'flex', gap: '8px', opacity: 0.6 }}>
                  <button onClick={() => startEdit(goal)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Edit">✎</button>
                  <button onClick={() => handleDelete(goal.id)} style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px' }} title="Delete">✖</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
