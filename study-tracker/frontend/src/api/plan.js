import { client } from './client'

export const generatePlan = async (subjectId, hoursPerDay) => {
  const data = await client(`/plan/generate/${subjectId}`, {
    method: 'POST',
    body: JSON.stringify({ hours_per_day: hoursPerDay }),
  })
  return data
}

export const getPlan = async (subjectId) => {
  const data = await client(`/plan/${subjectId}`)
  return data
}

export const getPlanStatus = async (subjectId) => {
  const data = await client(`/plan/status/${subjectId}`)
  return data
}

export const adjustPlan = async (subjectId) => {
  const data = await client(`/plan/adjust/${subjectId}`, {
    method: 'POST',
  })
  return data
}
