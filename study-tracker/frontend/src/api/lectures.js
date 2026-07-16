import api from './client'
export const getLectures = (subjectId) => api.get(`/lectures/${subjectId}`).then(r => r.data)
export const markLectureComplete = (lectureId, completed) => api.put(`/lectures/complete/${lectureId}`, { completed }).then(r => r.data)
export const batchMarkComplete = (lectureIds, completed) => api.put('/lectures/batch-complete', lectureIds, { params: { completed } }).then(r => r.data)
export const updateLecture = (lectureId, data) => api.put(`/lectures/${lectureId}`, data).then(r => r.data)
export const deleteLecture = (lectureId) => api.delete(`/lectures/${lectureId}`).then(r => r.data)
export const deleteSubjectLectures = (subjectId) => api.delete(`/lectures/subject/${subjectId}`).then(r => r.data)
export const reorderLectures = (subjectId, lectureIds) => api.put(`/lectures/subject/${subjectId}/reorder`, { lecture_ids: lectureIds }).then(r => r.data)

export const getBookmarks = (lectureId) => api.get(`/lectures/${lectureId}/bookmarks`).then(r => r.data)
export const addBookmark = (lectureId, timestamp, note) => api.post(`/lectures/${lectureId}/bookmarks`, { timestamp, note }).then(r => r.data)
export const deleteBookmark = (bookmarkId) => api.delete(`/lectures/bookmarks/${bookmarkId}`).then(r => r.data)

