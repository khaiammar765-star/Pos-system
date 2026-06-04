import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'
import ReceiptModal from '../components/ReceiptModal'

export default function CheckoutPage() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [alert, setAlert] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [receiptSale, setReceiptSale] = useState(null)

  useEffect(() => {
    api.get('/api/products').then(r => setProducts(r.data)).catch(err => { if (err.response?.status !== 401) console.error('Failed to load products', err) })
    api.get('/api/customers').then(r => setCustomers(r.data))
    api.get('/api/categories').then(r => setCategories(r.data))
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

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const total = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
  const change = parseFloat(paymentAmount || 0) - total

  const filtered = products
    .filter(p => p.active)
    .filter(p => !filterCat || p.category?.id === parseInt(filterCat))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  async function handleCheckout() {
    if (cart.length === 0) return showAlert('warning', 'Cart is empty.')
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      return showAlert('warning', 'Please enter payment amount.')
    }
    if (paymentMethod === 'CASH' && parseFloat(paymentAmount) < total) {
      return showAlert('warning', 'Payment amount is less than total.')
    }
    setProcessing(true)
    try {
      const res = await api.post('/api/sales', {
        customerId: customerId || null,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        paymentAmount: parseFloat(paymentAmount || total),
        notes,
      })
      if (res.data.success) {
        const saleRes = await api.get(`/api/sales/${res.data.saleId}`)
        setReceiptSale(saleRes.data)
        setCart([])
        setPaymentAmount('')
        setNotes('')
        setCustomerId('')
      } else {
        showAlert('danger', res.data.message)
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error processing sale.')
    } finally {
      setProcessing(false)
    }
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 4000)
  }

  return (
    <>
    <div className="min-vh-100 bg-light">
      <TopNav title="Checkout" />

      {alert && (
        <div className={`alert alert-${alert.type} m-3 mb-0`}>{alert.message}</div>
      )}

      <div className="container-fluid py-3">
        <div className="row g-3">

          {/* Left — Products */}
          <div className="col-md-7">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="row g-2 mb-3">
                  <div className="col">
                    <input className="form-control" placeholder="Search products..."
                      value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <div className="col-auto">
                    <select className="form-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                      <option value="">All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="row g-2" style={{ maxHeight: 480, overflowY: 'auto' }}>
                  {filtered.map(p => (
                    <div className="col-6 col-lg-4" key={p.id}>
                      <div
                        className="card border-0 shadow-sm h-100 text-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => addToCart(p)}
                      >
                        <div className="card-body py-3">
                          <div className="text-primary mb-1"><i className="bi bi-box-seam fs-4"></i></div>
                          <p className="fw-semibold mb-1 small">{p.name}</p>
                          <p className="text-success fw-bold mb-1">RM {parseFloat(p.price).toFixed(2)}</p>
                          <p className="text-muted" style={{ fontSize: 11 }}>Stock: {p.inventory?.quantity ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center text-muted py-4 w-100">No products found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Cart */}
          <div className="col-md-5">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="fw-bold mb-3"><i className="bi bi-cart me-2"></i>Cart</h6>

                {cart.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-cart-x fs-1 d-block mb-2"></i>Cart is empty
                  </div>
                ) : (
                  <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {cart.map(item => (
                      <div key={item.productId} className="d-flex align-items-center mb-2 gap-2">
                        <div className="flex-grow-1 small fw-semibold">{item.name}</div>
                        <div className="d-flex align-items-center gap-1">
                          <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                          <span className="px-2">{item.quantity}</span>
                          <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                        </div>
                        <div className="small fw-bold" style={{ minWidth: 70, textAlign: 'right' }}>
                          RM {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                        <button className="btn btn-sm btn-outline-danger px-2 py-0"
                          onClick={() => removeFromCart(item.productId)}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <hr />

                <div className="mb-2">
                  <label className="form-label fw-semibold small">Customer (optional)</label>
                  <select className="form-select form-select-sm" value={customerId}
                    onChange={e => setCustomerId(e.target.value)}>
                    <option value="">Walk-in</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold small">Payment Method</label>
                  <select className="form-select form-select-sm" value={paymentMethod}
                    onChange={e => {
                      setPaymentMethod(e.target.value)
                      if (e.target.value !== 'CASH') setPaymentAmount(total.toFixed(2))
                      else setPaymentAmount('')
                    }}>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="EWALLET">E-Wallet</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold small">
                    Payment Amount (RM) <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control form-control-sm"
                    type="number" step="0.01"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    readOnly={paymentMethod !== 'CASH'}
                  />
                  {paymentMethod !== 'CASH' && (
                    <div className="form-text">Auto-filled for {paymentMethod} payments.</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Notes</label>
                  <input className="form-control form-control-sm" value={notes}
                    onChange={e => setNotes(e.target.value)} placeholder="Optional notes" />
                </div>

                <div className="d-flex justify-content-between fw-bold mb-1">
                  <span>Total</span>
                  <span>RM {total.toFixed(2)}</span>
                </div>
                {paymentMethod === 'CASH' && paymentAmount && (
                  <div className={`d-flex justify-content-between small mb-2 ${change < 0 ? 'text-danger' : 'text-success'}`}>
                    <span>Change</span>
                    <span>RM {change.toFixed(2)}</span>
                  </div>
                )}

                <button
                  className="btn btn-dark w-100 fw-semibold"
                  onClick={handleCheckout}
                  disabled={processing || cart.length === 0}
                >
                  {processing
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                    : <><i className="bi bi-check-circle me-2"></i>Complete Sale</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {receiptSale && (
      <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
    )}
    </>
  )
}
