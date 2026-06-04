import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [alert, setAlert] = useState(null)

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    try {
      const res = await api.get('/api/categories')
      setCategories(res.data)
    } catch (err) { if (err.response?.status !== 401) console.error('Failed to load categories', err) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditCategory(null)
    setForm({ name: '', description: '' })
    setShowModal(true)
  }

  function openEdit(cat) {
    setEditCategory(cat)
    setForm({ name: cat.name, description: cat.description || '' })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editCategory) {
        await api.put(`/api/categories/${editCategory.id}`, form)
        showAlert('success', 'Category updated.')
      } else {
        await api.post('/api/categories', form)
        showAlert('success', 'Category created.')
      }
      setShowModal(false)
      fetchCategories()
    } catch { showAlert('danger', 'Something went wrong.') }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return
    try {
      await api.delete(`/api/categories/${id}`)
      showAlert('success', 'Category deleted.')
      fetchCategories()
    } catch (err) { showAlert('danger', err.response?.data?.message || 'Cannot delete category.') }
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="Categories" />

      <div className="container py-4">
        {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-dark" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Add Category
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
                    <th>Description</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-4">No categories found.</td></tr>
                  ) : categories.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{c.name}</td>
                      <td className="text-muted small">{c.description || '-'}</td>
                      <td>{c.productCount ?? 0}</td>
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
                <h5 className="modal-title">{editCategory ? 'Edit Category' : 'Add Category'}</h5>
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
                    <label className="form-label fw-semibold">Description</label>
                    <textarea className="form-control" rows={2} value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-dark">{editCategory ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
