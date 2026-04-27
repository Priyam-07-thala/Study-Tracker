import { useState, useEffect, useCallback } from 'react'
import { getSubjects, createSubject } from '../api/subjects'

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

  return { subjects, loading, error, refetch: fetchSubjects, addSubject }
}
