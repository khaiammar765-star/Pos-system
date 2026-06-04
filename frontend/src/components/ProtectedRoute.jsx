import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api/axios'

/**
 * Gate that wraps every staff page.
 * On mount it asks the backend "who am I?" (GET /api/auth/me):
 *   - while waiting      → show a spinner (page content stays hidden)
 *   - 200 (logged in)    → render the page
 *   - 401 (not logged in)→ redirect to /login
 *   - adminOnly + not admin → bounce back to /dashboard
 *
 * This stops anyone from reaching a page just by typing its URL.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const [status, setStatus] = useState('checking') // checking | authed | denied
  const [user, setUser] = useState(null)

  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => {
        setUser(res.data)
        setStatus('authed')
      })
      .catch(() => setStatus('denied'))
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-secondary"></div>
      </div>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
