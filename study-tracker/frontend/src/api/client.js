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
    
    let msg = 'Unknown error'
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail
      if (typeof detail === 'string') {
        msg = detail
      } else if (Array.isArray(detail)) {
        msg = detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ')
      } else {
        msg = JSON.stringify(detail)
      }
    } else {
      msg = err.message || msg
    }
    
    // Remove "Value error, " prefix from Pydantic validator errors to make them clean
    if (msg.startsWith('Value error, ')) {
      msg = msg.replace('Value error, ', '')
    }

    return Promise.reject(new Error(msg)) 
  }
)
export default api
