import api from './client'
export const getSubjects = () => api.get('/subjects').then(r => r.data)
export const createSubject = (data) => api.post('/subjects', data).then(r => r.data)
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data).then(r => r.data)
export const deleteSubject = (id) => api.delete(`/subjects/${id}`).then(r => r.data)
export const pauseSubject = (id) => api.put(`/subjects/${id}/pause`).then(r => r.data)
export const resumeSubject = (id) => api.put(`/subjects/${id}/resume`).then(r => r.data)
