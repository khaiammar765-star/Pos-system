import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)

      const res = await api.post('/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      if (res.data.success) {
        navigate('/dashboard')
      }
    } catch (err) {
      const message = err.response?.data?.message
      setError(message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg" style={{ width: 380 }}>
        <div className="card-body p-5">

          <div className="text-center mb-4">
            <img src="/logo.png" alt="Warung Orang Lama" className="wol-login-logo mb-3" />
            <p className="text-muted small mb-0">Sign in to your account</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Username</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 fw-semibold"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
              }
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
