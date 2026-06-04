import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TopNav from '../components/TopNav'
import ReceiptModal from '../components/ReceiptModal'

export default function SalesPage() {
  const navigate = useNavigate()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [viewSale, setViewSale] = useState(null)

  useEffect(() => { fetchSales() }, [])

  async function fetchSales() {
    try {
      const res = await api.get('/api/sales')
      setSales(res.data)
    } catch (err) { if (err.response?.status !== 401) console.error('Failed to load sales', err) }
    finally { setLoading(false) }
  }

  async function handleVoid(id) {
    if (!confirm('Void this sale? Stock will be restored.')) return
    try {
      await api.patch(`/api/sales/${id}/void`)
      showAlert('success', `Sale #${id} voided.`)
      fetchSales()
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Cannot void sale.')
    }
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  function formatDate(dt) {
    return new Date(dt).toLocaleString('en-MY')
  }

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="Sales History" />

      <div className="container py-4">
        {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-dark" onClick={() => navigate('/checkout')}>
            <i className="bi bi-cart-plus me-1"></i>New Sale
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
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Cashier</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-muted py-4">No sales found.</td></tr>
                  ) : sales.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td className="small">{formatDate(s.createdAt)}</td>
                      <td>{s.customer?.name || <span className="text-muted">Walk-in</span>}</td>
                      <td>{s.user?.fullName || s.user?.username}</td>
                      <td>{s.items?.length}</td>
                      <td className="fw-semibold">RM {parseFloat(s.totalAmount).toFixed(2)}</td>
                      <td><span className="badge bg-secondary">{s.paymentMethod}</span></td>
                      <td>
                        <span className={`badge bg-${s.status === 'COMPLETED' ? 'success' : 'danger'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setViewSale(s)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        {s.status === 'COMPLETED' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleVoid(s.id)}>
                            <i className="bi bi-x-circle"></i>
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

      {viewSale && (
        <ReceiptModal sale={viewSale} onClose={() => setViewSale(null)} />
      )}
    </div>
  )
}
