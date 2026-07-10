import api from './client'

export const generatePlan = async (subjectId, payload) => {
  return api.post(`/plan/generate/${subjectId}`, payload).then(r => r.data)
}

export const getPlan = async (subjectId) => {
  return api.get(`/plan/${subjectId}`).then(r => r.data)
}

export const getPlanStatus = async (subjectId) => {
  return api.get(`/plan/status/${subjectId}`).then(r => r.data)
}

export const adjustPlan = async (subjectId) => {
  return api.post(`/plan/adjust/${subjectId}`).then(r => r.data)
}

