import api from './client'
export const getProgress = (subjectId) => api.get(`/progress/${subjectId}`).then(r => r.data)
