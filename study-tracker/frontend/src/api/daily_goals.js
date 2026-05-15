import api from './client';

export const dailyGoalsApi = {
  getGoals: async () => {
    return api.get('/daily_goals').then(r => r.data);
  },
  
  createGoal: async (data) => {
    return api.post('/daily_goals', data).then(r => r.data);
  },
  
  updateGoal: async (id, data) => {
    return api.put(`/daily_goals/${id}`, data).then(r => r.data);
  },
  
  deleteGoal: async (id) => {
    return api.delete(`/daily_goals/${id}`).then(r => r.data);
  }
};
