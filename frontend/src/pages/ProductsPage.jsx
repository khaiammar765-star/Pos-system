import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', sku: '', categoryId: '', active: true })
  const [initialStock, setInitialStock] = useState(0)
  const [minStockLevel, setMinStockLevel] = useState(5)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  async function fetchProducts() {
    try {
      const res = await api.get('/api/products')
      setProducts(res.data)
    } catch (err) {
      if (err.response?.status !== 401) console.error('Failed to load products', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    const res = await api.get('/api/categories')
    setCategories(res.data)
  }

  function openCreate() {
    setEditProduct(null)
    setForm({ name: '', description: '', price: '', sku: '', categoryId: '', active: true })
    setInitialStock(0)
    setMinStockLevel(5)
    setShowModal(true)
  }

  function openEdit(product) {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      sku: product.sku || '',
      categoryId: product.category?.id || '',
      active: product.active,
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        sku: form.sku,
        active: form.active,
        category: form.categoryId ? { id: form.categoryId } : null,
      }

      if (editProduct) {
        await api.put(`/api/products/${editProduct.id}`, body)
        showAlert('success', 'Product updated successfully.')
      } else {
        await api.post(`/api/products?initialStock=${initialStock}&minStockLevel=${minStockLevel}`, body)
        showAlert('success', 'Product created successfully.')
      }
      setShowModal(false)
      fetchProducts()
    } catch {
      showAlert('danger', 'Something went wrong.')
    }
  }

  async function handleToggle(id) {
    await api.patch(`/api/products/${id}/toggle`)
    fetchProducts()
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="Products" />

      <div className="container py-4">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible`}>
            {alert.message}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              className="form-control"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-dark" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Add Product
          </button>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary"></div>
              </div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted py-4">No products found.</td></tr>
                  ) : filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{p.name}</td>
                      <td><span className="text-muted small">{p.sku || '-'}</span></td>
                      <td>{p.category?.name || '-'}</td>
                      <td>RM {parseFloat(p.price).toFixed(2)}</td>
                      <td>{p.inventory?.quantity ?? '-'}</td>
                      <td>
                        <span className={`badge bg-${p.active ? 'success' : 'secondary'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className={`btn btn-sm btn-outline-${p.active ? 'warning' : 'success'}`}
                          onClick={() => handleToggle(p.id)}
                        >
                          <i className={`bi bi-${p.active ? 'pause' : 'play'}`}></i>
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
                <h5 className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</h5>
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
                    <label className="form-label fw-semibold">SKU</label>
                    <input className="form-control" value={form.sku}
                      onChange={e => setForm({ ...form, sku: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Price (RM)</label>
                    <input className="form-control" type="number" step="0.01" required value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Category</label>
                    <select className="form-select" value={form.categoryId}
                      onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">-- No Category --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea className="form-control" rows={2} value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  {!editProduct && (
                    <div className="row">
                      <div className="col">
                        <label className="form-label fw-semibold">Initial Stock</label>
                        <input className="form-control" type="number" value={initialStock}
                          onChange={e => setInitialStock(parseInt(e.target.value))} />
                      </div>
                      <div className="col">
                        <label className="form-label fw-semibold">Min Stock Level</label>
                        <input className="form-control" type="number" value={minStockLevel}
                          onChange={e => setMinStockLevel(parseInt(e.target.value))} />
                      </div>
                    </div>
                  )}
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" checked={form.active}
                      onChange={e => setForm({ ...form, active: e.target.checked })} />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-dark">
                    {editProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
