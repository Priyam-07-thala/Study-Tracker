import { useState, useEffect, useCallback } from 'react';
import { dailyGoalsApi } from '../api/daily_goals';

export function useDailyGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dailyGoalsApi.getGoals();
      setGoals(data);
    } catch (err) {
      setError(err.message || 'Failed to load daily goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (title) => {
    try {
      const newGoal = await dailyGoalsApi.createGoal({ title });
      setGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      throw new Error(err.message || 'Failed to add goal');
    }
  };

  const updateGoal = async (id, data) => {
    try {
      const updatedGoal = await dailyGoalsApi.updateGoal(id, data);
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
      return updatedGoal;
    } catch (err) {
      throw new Error(err.message || 'Failed to update goal');
    }
  };

  const deleteGoal = async (id) => {
    try {
      await dailyGoalsApi.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete goal');
    }
  };

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    refreshGoals: fetchGoals
  };
}
