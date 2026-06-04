import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TopNav from '../components/TopNav'
import CloseTabModal from '../components/CloseTabModal'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [activeTab, setActiveTab] = useState('orders')
  const [closeTabSession, setCloseTabSession] = useState(null)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => fetchAll(true), 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAll(silent = false) {
    if (!silent) setLoading(true)
    try {
      const ordersRes = await api.get('/api/orders/pending')
      setOrders(ordersRes.data)
    } catch (err) {
      if (err.response?.status === 401) { navigate('/login'); return }
    }
    try {
      const sessionsRes = await api.get('/api/sessions/open')
      setSessions(sessionsRes.data)
    } catch {
      // sessions endpoint may not be ready yet, orders still show
    }
    setLastRefresh(new Date())
    setLoading(false)
  }

  async function handleComplete(id) {
    try {
      await api.patch(`/api/orders/${id}/complete`)
      showAlert('success', `Order #${id} marked as completed.`)
      fetchAll(true)
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Something went wrong.')
    }
  }

  async function handleVoid(id) {
    if (!confirm('Void this order?')) return
    try {
      await api.patch(`/api/orders/${id}/void`)
      showAlert('warning', `Order #${id} voided.`)
      fetchAll(true)
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Something went wrong.')
    }
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  function formatTime(dt) {
    return new Date(dt).toLocaleTimeString('en-MY')
  }

  function minutesAgo(dt) {
    const diff = Math.floor((new Date() - new Date(dt)) / 60000)
    if (diff === 0) return 'Just now'
    return `${diff} min ago`
  }

  return (
    <>
      {closeTabSession && (
        <CloseTabModal
          session={closeTabSession}
          onClose={() => setCloseTabSession(null)}
          onClosed={() => {
            showAlert('success', `Table ${closeTabSession.tableNumber} tab closed successfully.`)
            fetchAll(true)
          }}
        />
      )}

      <div className="min-vh-100 bg-light">
        <TopNav title="Orders & Tables" />

        <div className="container py-4">
          {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <i className="bi bi-bell me-1"></i>
                Pending Orders
                {orders.length > 0 && <span className="badge bg-danger ms-2">{orders.length}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'sessions' ? 'active' : ''}`}
                onClick={() => setActiveTab('sessions')}
              >
                <i className="bi bi-table me-1"></i>
                Open Tabs
                {sessions.length > 0 && <span className="badge bg-warning text-dark ms-2">{sessions.length}</span>}
              </button>
            </li>
          </ul>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small">
              Auto-refreshes every 10s — Last: {formatTime(lastRefresh)}
            </span>
            <button className="btn btn-outline-dark btn-sm" onClick={() => fetchAll()}>
              <i className="bi bi-arrow-clockwise me-1"></i>Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-secondary"></div></div>
          ) : activeTab === 'orders' ? (
            /* ── Pending Orders Tab ── */
            orders.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-check-circle text-success fs-1 d-block mb-3"></i>
                <h5 className="text-muted">No pending orders</h5>
                <p className="text-muted small">New orders will appear here automatically</p>
              </div>
            ) : (
              <div className="row g-3">
                {orders.map(order => (
                  <div className="col-md-6 col-lg-4" key={order.id}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-warning d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Table {order.tableNumber}</span>
                        <span className="small">Order #{order.id}</span>
                      </div>
                      <div className="card-body">
                        <p className="text-muted small mb-2">
                          <i className="bi bi-clock me-1"></i>
                          {formatTime(order.createdAt)} ({minutesAgo(order.createdAt)})
                        </p>

                        {order.items?.map(item => (
                          <div key={item.id} className="d-flex justify-content-between small mb-1">
                            <span>
                              <span className="badge bg-dark me-1">{item.quantity}x</span>
                              {item.product?.name}
                            </span>
                            <span className="text-muted">RM {parseFloat(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}

                        {order.notes && (
                          <div className="alert alert-info py-1 px-2 mt-2 small mb-0">
                            <i className="bi bi-chat-left-text me-1"></i>{order.notes}
                          </div>
                        )}

                        <hr />
                        <div className="d-flex justify-content-between fw-bold mb-3">
                          <span>Total</span>
                          <span>RM {parseFloat(order.totalAmount).toFixed(2)}</span>
                        </div>

                        <div className="d-grid gap-2">
                          <button className="btn btn-success" onClick={() => handleComplete(order.id)}>
                            <i className="bi bi-check-circle me-1"></i>Mark as Completed
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleVoid(order.id)}>
                            <i className="bi bi-x-circle me-1"></i>Void Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ── Open Tabs Tab ── */
            sessions.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-table text-muted fs-1 d-block mb-3"></i>
                <h5 className="text-muted">No open tabs</h5>
                <p className="text-muted small">Tabs open automatically when a table places an order</p>
              </div>
            ) : (
              <div className="row g-3">
                {sessions.map(session => (
                  <div className="col-md-6 col-lg-4" key={session.id}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <span className="fw-bold">
                          <i className="bi bi-table me-1"></i>Table {session.tableNumber}
                        </span>
                        <span className="badge bg-success">OPEN</span>
                      </div>
                      <div className="card-body">
                        <p className="text-muted small mb-3">
                          <i className="bi bi-clock me-1"></i>
                          Opened: {new Date(session.openedAt).toLocaleString('en-MY')}
                        </p>
                        <button
                          className="btn btn-dark w-100"
                          onClick={() => setCloseTabSession(session)}
                        >
                          <i className="bi bi-receipt me-1"></i>Close Tab & Bill
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}
