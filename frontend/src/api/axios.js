import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
})

// Central auth handling:
// Only a 401 (not logged in / session expired) should send the user to login.
// Any OTHER error (500 server error, network down) is passed back to the page
// so it can show a real error message instead of bouncing to login.
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
