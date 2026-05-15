import { useState, useEffect, useCallback } from 'react'
import { getSubjects, createSubject, updateSubject, deleteSubject, pauseSubject, resumeSubject } from '../api/subjects'

export function useSubjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSubjects = useCallback(async () => {
    try { setLoading(true); setError(null); setSubjects(await getSubjects()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const addSubject = useCallback(async (payload) => {
    const created = await createSubject(payload)
    setSubjects(prev => [created, ...prev])
    return created
  }, [])

  const editSubjectAction = useCallback(async (id, payload) => {
    const updated = await updateSubject(id, payload)
    setSubjects(prev => prev.map(s => s.id === id ? updated : s))
    return updated
  }, [])

  const removeSubjectAction = useCallback(async (id) => {
    await deleteSubject(id)
    setSubjects(prev => prev.filter(s => s.id !== id))
  }, [])

  const pauseSubjectAction = useCallback(async (id) => {
    const updated = await pauseSubject(id)
    setSubjects(prev => prev.map(s => s.id === id ? updated : s))
    return updated
  }, [])

  const resumeSubjectAction = useCallback(async (id) => {
    const updated = await resumeSubject(id)
    setSubjects(prev => prev.map(s => s.id === id ? updated : s))
    return updated
  }, [])

  return { subjects, loading, error, refetch: fetchSubjects, addSubject, editSubjectAction, removeSubjectAction, pauseSubjectAction, resumeSubjectAction }
}
