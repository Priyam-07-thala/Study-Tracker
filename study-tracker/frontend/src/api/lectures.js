import api from './client'
export const getLectures = (subjectId) => api.get(`/lectures/${subjectId}`).then(r => r.data)
export const markLectureComplete = (lectureId, completed) => api.put(`/lectures/complete/${lectureId}`, { completed }).then(r => r.data)
export const batchMarkComplete = (lectureIds, completed) => api.put('/lectures/batch-complete', lectureIds, { params: { completed } }).then(r => r.data)
