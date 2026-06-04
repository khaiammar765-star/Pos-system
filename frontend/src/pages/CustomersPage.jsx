import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [alert, setAlert] = useState(null)

  useEffect(() => { fetchCustomers() }, [])

  async function fetchCustomers() {
    try {
      const res = await api.get('/api/customers')
      setCustomers(res.data)
    } catch (err) { if (err.response?.status !== 401) console.error('Failed to load customers', err) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditCustomer(null)
    setForm({ name: '', email: '', phone: '', address: '' })
    setShowModal(true)
  }

  function openEdit(c) {
    setEditCustomer(c)
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editCustomer) {
        await api.put(`/api/customers/${editCustomer.id}`, form)
        showAlert('success', 'Customer updated.')
      } else {
        await api.post('/api/customers', form)
        showAlert('success', 'Customer added.')
      }
      setShowModal(false)
      fetchCustomers()
    } catch { showAlert('danger', 'Something went wrong.') }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this customer?')) return
    try {
      await api.delete(`/api/customers/${id}`)
      showAlert('success', 'Customer deleted.')
      fetchCustomers()
    } catch (err) { showAlert('danger', err.response?.data?.message || 'Cannot delete customer.') }
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="Customers" />

      <div className="container py-4">
        {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" placeholder="Search customers..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-dark" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Add Customer
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">No customers found.</td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{c.name}</td>
                      <td className="text-muted small">{c.email || '-'}</td>
                      <td>{c.phone || '-'}</td>
                      <td className="text-muted small">{c.address || '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(c)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
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
                <h5 className="modal-title">{editCustomer ? 'Edit Customer' : 'Add Customer'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Name</label>
                    <input className="form-control" required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input className="form-control" type="email" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone</label>
                    <input className="form-control" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Address</label>
                    <textarea className="form-control" rows={2} value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-dark">{editCustomer ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
