import api from './client'
export const importPlaylist = (subjectId, playlistUrl) =>
  api.post('/youtube/import', { subject_id: subjectId, playlist_url: playlistUrl }).then(r => r.data)
