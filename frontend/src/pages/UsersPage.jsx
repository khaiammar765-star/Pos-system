import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'CASHIER', active: true })
  const [alert, setAlert] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    try {
      const res = await api.get('/api/users')
      setUsers(res.data)
    } catch (err) { if (err.response?.status !== 401) console.error('Failed to load users', err) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditUser(null)
    setForm({ username: '', password: '', fullName: '', email: '', role: 'CASHIER', active: true })
    setShowModal(true)
  }

  function openEdit(user) {
    setEditUser(user)
    setForm({ username: user.username, password: '', fullName: user.fullName, email: user.email || '', role: user.role, active: user.active })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editUser) {
        await api.put(`/api/users/${editUser.id}`, form)
        showAlert('success', 'User updated.')
      } else {
        await api.post('/api/users', form)
        showAlert('success', 'User created.')
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      // Show the backend's real message (e.g. "Username already exists")
      showAlert('danger', err.response?.data?.message || 'Something went wrong.')
    }
  }

  async function handleToggle(id) {
    await api.patch(`/api/users/${id}/toggle`)
    fetchUsers()
  }

  async function handleUnlock(id) {
    await api.patch(`/api/users/${id}/unlock`)
    showAlert('success', 'Account unlocked.')
    fetchUsers()
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  function formatDate(dt) {
    return dt ? new Date(dt).toLocaleString('en-MY') : '-'
  }

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="User Management" />

      <div className="container py-4">
        {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-dark" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Add User
          </button>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-secondary"></div></div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Account</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-muted py-4">No users found.</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{u.fullName}</td>
                      <td>{u.username}</td>
                      <td className="text-muted small">{u.email || '-'}</td>
                      <td>
                        <span className={`badge bg-${u.role === 'ADMIN' ? 'dark' : 'primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${u.active ? 'success' : 'secondary'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {!u.accountNonLocked ? (
                          <span className="badge bg-danger">Locked</span>
                        ) : (
                          <span className="badge bg-success">OK</span>
                        )}
                      </td>
                      <td className="small text-muted">{formatDate(u.createdAt)}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className={`btn btn-sm btn-outline-${u.active ? 'warning' : 'success'} me-1`}
                          onClick={() => handleToggle(u.id)}
                        >
                          <i className={`bi bi-${u.active ? 'pause' : 'play'}`}></i>
                        </button>
                        {!u.accountNonLocked && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleUnlock(u.id)}>
                            <i className="bi bi-unlock"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editUser ? 'Edit User' : 'Add User'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input className="form-control" required value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Username</label>
                    <input className="form-control" required value={form.username}
                      disabled={!!editUser}
                      onChange={e => setForm({ ...form, username: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Password {editUser && <span className="text-muted small">(leave blank to keep current)</span>}
                    </label>
                    <input className="form-control" type="password" value={form.password}
                      required={!editUser}
                      onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input className="form-control" type="email" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <select className="form-select" value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="CASHIER">Cashier</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={form.active}
                      onChange={e => setForm({ ...form, active: e.target.checked })} />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-dark">{editUser ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
