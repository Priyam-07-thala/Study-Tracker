import axios from 'axios'
const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('user_id')
  if (userId) {
    config.headers['X-User-Id'] = userId
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => { 
    if (err.response?.status === 401) {
      // Clear local storage and redirect to login if unauthorized
      localStorage.removeItem('user_id')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    const msg = err.response?.data?.detail || err.message || 'Unknown error'
    return Promise.reject(new Error(msg)) 
  }
)
export default api
