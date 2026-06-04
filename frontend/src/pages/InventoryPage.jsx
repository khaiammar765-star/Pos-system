import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [minStock, setMinStock] = useState(0)
  const [alert, setAlert] = useState(null)

  useEffect(() => { fetchInventory() }, [])

  async function fetchInventory() {
    try {
      const res = await api.get('/api/inventory')
      setInventory(res.data)
    } catch (err) { if (err.response?.status !== 401) console.error('Failed to load inventory', err) }
    finally { setLoading(false) }
  }

  function openAdjust(item) {
    setSelected(item)
    setAdjustQty(0)
    setMinStock(item.minStockLevel)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    try {
      if (adjustQty !== 0) {
        await api.patch(`/api/inventory/${selected.product.id}/adjust`, { quantity: parseInt(adjustQty) })
      }
      await api.patch(`/api/inventory/${selected.product.id}/min-stock`, { minStockLevel: parseInt(minStock) })
      showAlert('success', 'Inventory updated.')
      setShowModal(false)
      fetchInventory()
    } catch { showAlert('danger', 'Something went wrong.') }
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const lowStock = inventory.filter(i => i.quantity <= i.minStockLevel)

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="Inventory" />

      <div className="container py-4">
        {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

        {lowStock.length > 0 && (
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>{lowStock.length}</strong> item(s) are low on stock.
          </div>
        )}

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-secondary"></div></div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Min Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">No inventory found.</td></tr>
                  ) : inventory.map((item, i) => {
                    const isLow = item.quantity <= item.minStockLevel
                    return (
                      <tr key={item.id}>
                        <td>{i + 1}</td>
                        <td className="fw-semibold">{item.product?.name}</td>
                        <td className="text-muted small">{item.product?.category?.name || '-'}</td>
                        <td>
                          <span className={`fw-bold ${isLow ? 'text-danger' : 'text-success'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td>{item.minStockLevel}</td>
                        <td>
                          <span className={`badge bg-${isLow ? 'danger' : 'success'}`}>
                            {isLow ? 'Low Stock' : 'OK'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openAdjust(item)}>
                            <i className="bi bi-pencil me-1"></i>Adjust
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && selected && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Adjust — {selected.product?.name}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <p className="text-muted small mb-3">Current stock: <strong>{selected.quantity}</strong></p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Adjust Quantity</label>
                    <input className="form-control" type="number" value={adjustQty}
                      onChange={e => setAdjustQty(e.target.value)} />
                    <div className="form-text">Use positive to add, negative to deduct. 0 = no change.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Min Stock Level</label>
                    <input className="form-control" type="number" value={minStock}
                      onChange={e => setMinStock(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-dark">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
