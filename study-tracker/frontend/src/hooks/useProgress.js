import { useState, useEffect, useCallback } from 'react'
import { getProgress } from '../api/progress'

export function useProgress(subjectId) {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgress = useCallback(async () => {
    if (!subjectId) return
    try { setLoading(true); setError(null); setProgress(await getProgress(subjectId)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [subjectId])

  useEffect(() => { fetchProgress() }, [fetchProgress])

  return { progress, loading, error, refetch: fetchProgress }
}
