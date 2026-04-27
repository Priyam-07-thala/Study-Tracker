import api from './client'
export const getSubjects = () => api.get('/subjects').then(r => r.data)
export const createSubject = (data) => api.post('/subjects', data).then(r => r.data)
