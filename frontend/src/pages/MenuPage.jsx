import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

// Public axios — no credentials needed
const publicApi = axios.create({ baseURL: '/' })

export default function MenuPage() {
  const { tableNumber } = useParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('menu') // menu | cart | success
  const [orderId, setOrderId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    Promise.all([
      publicApi.get('/api/public/products'),
      publicApi.get('/api/public/categories'),
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data)
      setCategories(catRes.data)
    }).finally(() => setLoading(false))
  }, [])

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  function updateQty(productId, qty) {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.productId !== productId))
    } else {
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i))
    }
  }

  const total = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)

  const filtered = products
    .filter(p => !filterCat || p.category?.id === parseInt(filterCat))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  async function handlePlaceOrder() {
    setSubmitting(true)
    try {
      const res = await publicApi.post('/api/public/order', {
        tableNumber: parseInt(tableNumber),
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        notes,
      })
      if (res.data.success) {
        setOrderId(res.data.orderId)
        setStep('success')
      } else {
        alert(res.data.message)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-dark mb-3"></div>
          <p className="text-muted">Loading menu...</p>
        </div>
      </div>
    )
  }

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center px-4">
          <div className="text-success mb-3" style={{ fontSize: 64 }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h3 className="fw-bold mb-2">Order Placed!</h3>
          <p className="text-muted mb-1">Order #{orderId}</p>
          <p className="text-muted mb-4">Table {tableNumber} — Please wait, we'll serve you shortly.</p>
          <div className="card border-0 shadow-sm p-4 mb-4 text-start" style={{ maxWidth: 320, margin: '0 auto' }}>
            {cart.map(item => (
              <div key={item.productId} className="d-flex justify-content-between mb-1 small">
                <span>{item.name} x{item.quantity}</span>
                <span>RM {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>RM {total.toFixed(2)}</span>
            </div>
          </div>
          <button className="btn btn-dark" onClick={() => { setCart([]); setStep('menu'); setNotes('') }}>
            <i className="bi bi-plus-circle me-1"></i>Order More
          </button>
        </div>
      </div>
    )
  }

  // Cart screen
  if (step === 'cart') {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-dark bg-dark px-3">
          <button className="btn btn-link text-white p-0" onClick={() => setStep('menu')}>
            <i className="bi bi-arrow-left fs-5"></i>
          </button>
          <span className="navbar-brand fw-bold mx-auto mb-0">Your Order</span>
          <span className="text-white small">Table {tableNumber}</span>
        </nav>

        <div className="container py-4" style={{ maxWidth: 480 }}>
          {cart.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-cart-x fs-1 d-block mb-2"></i>
              Your cart is empty
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.productId} className="card border-0 shadow-sm mb-2">
                  <div className="card-body py-2 d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="fw-semibold mb-0 small">{item.name}</p>
                      <p className="text-success mb-0 small">RM {parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                        onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                      <span className="fw-bold">{item.quantity}</span>
                      <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                        onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <div className="ms-3 fw-bold small" style={{ minWidth: 65, textAlign: 'right' }}>
                      RM {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="mb-3 mt-3">
                <label className="form-label fw-semibold small">Special Instructions (optional)</label>
                <textarea className="form-control" rows={2} placeholder="e.g. no spicy, less sugar..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div className="card border-0 shadow-sm p-3 mb-3">
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>RM {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-dark w-100 fw-semibold py-3"
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Placing Order...</>
                  : <><i className="bi bi-check-circle me-2"></i>Place Order</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Menu screen
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand fw-bold mb-0">
          <img src="/logo.png" alt="Warung Orang Lama" style={{ height: 52 }} />
        </span>
        <span className="text-white small">Table {tableNumber}</span>
      </nav>

      <div className="container py-3">
        {/* Search & Filter */}
        <div className="row g-2 mb-3">
          <div className="col">
            <input className="form-control" placeholder="Search menu..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-auto">
            <select className="form-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="row g-3 mb-5">
          {filtered.length === 0 ? (
            <div className="text-center text-muted py-5">No items found.</div>
          ) : filtered.map(p => (
            <div className="col-6 col-md-4" key={p.id}>
              <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }}
                onClick={() => addToCart(p)}>
                <div className="card-body text-center py-3">
                  <div className="text-primary mb-2"><i className="bi bi-box-seam fs-2"></i></div>
                  <p className="fw-semibold mb-1 small">{p.name}</p>
                  <p className="text-success fw-bold mb-0">RM {parseFloat(p.price).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 999 }}>
          <button className="btn btn-dark shadow-lg px-4 py-3 fw-semibold" onClick={() => setStep('cart')}
            style={{ borderRadius: 50, minWidth: 200 }}>
            <i className="bi bi-cart me-2"></i>
            View Order ({cart.reduce((s, i) => s + i.quantity, 0)} items) — RM {total.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  )
}
