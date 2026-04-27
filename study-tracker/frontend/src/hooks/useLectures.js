import { useState, useEffect, useCallback } from 'react'
import { getLectures, markLectureComplete } from '../api/lectures'

export function useLectures(subjectId) {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingIds, setPendingIds] = useState(new Set())

  const fetchLectures = useCallback(async () => {
    if (!subjectId) return
    try { setLoading(true); setError(null); setLectures(await getLectures(subjectId)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [subjectId])

  useEffect(() => { fetchLectures() }, [fetchLectures])

  const toggleLecture = useCallback(async (lectureId, completed) => {
    setLectures(prev => prev.map(l => l.id === lectureId ? { ...l, completed } : l))
    setPendingIds(prev => new Set([...prev, lectureId]))
    try {
      const updated = await markLectureComplete(lectureId, completed)
      setLectures(prev => prev.map(l => l.id === lectureId ? updated : l))
    } catch (err) {
      setLectures(prev => prev.map(l => l.id === lectureId ? { ...l, completed: !completed } : l))
      throw err
    } finally {
      setPendingIds(prev => { const s = new Set(prev); s.delete(lectureId); return s })
    }
  }, [])

  return { lectures, loading, error, refetch: fetchLectures, toggleLecture, pendingIds }
}
