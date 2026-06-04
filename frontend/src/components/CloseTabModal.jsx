import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function CloseTabModal({ session, onClose, onClosed }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    api.get(`/api/sessions/${session.id}/orders`)
      .then(res => {
        const active = res.data.filter(o => o.status !== 'VOIDED')
        setOrders(active)
        const total = active.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)
        if (paymentMethod !== 'CASH') setPaymentAmount(total.toFixed(2))
      })
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [session.id])

  const combinedTotal = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0)
  const allItems = orders.flatMap(o => o.items || [])

  // Merge duplicate products
  const mergedItems = allItems.reduce((acc, item) => {
    const existing = acc.find(i => i.product?.id === item.product?.id)
    if (existing) {
      existing.quantity += item.quantity
      existing.subtotal = (parseFloat(existing.subtotal) + parseFloat(item.subtotal)).toFixed(2)
    } else {
      acc.push({ ...item })
    }
    return acc
  }, [])

  function handlePaymentMethodChange(method) {
    setPaymentMethod(method)
    if (method !== 'CASH') {
      setPaymentAmount(combinedTotal.toFixed(2))
    } else {
      setPaymentAmount('')
    }
  }

  async function handleCloseTab() {
    const paid = parseFloat(paymentAmount)
    if (isNaN(paid) || paid < combinedTotal) {
      setError('Payment amount must be at least RM ' + combinedTotal.toFixed(2))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.patch(`/api/sessions/${session.id}/close`)
      setShowReceipt(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close tab.')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleDone() {
    onClosed()
    onClose()
  }

  const change = parseFloat(paymentAmount || 0) - combinedTotal

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #tab-receipt, #tab-receipt * { visibility: visible; }
          #tab-receipt {
            position: fixed;
            top: 0; left: 0;
            width: 80mm;
            padding: 10px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header no-print">
              <h5 className="modal-title">
                <i className="bi bi-receipt me-2"></i>Close Tab — Table {session.tableNumber}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-secondary"></div></div>
              ) : (
                <>
                  {/* Combined Receipt */}
                  <div id="tab-receipt" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    <div className="text-center mb-2">
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>WARUNG ORANG LAMA</div>
                      <div style={{ fontSize: 11, color: '#666' }}>Table {session.tableNumber} — Combined Bill</div>
                      <hr style={{ borderTop: '1px dashed #999' }} />
                    </div>

                    <div style={{ fontSize: 11, marginBottom: 8 }}>
                      <div>Session #: {session.id}</div>
                      <div>Opened: {new Date(session.openedAt).toLocaleString('en-MY')}</div>
                      <div>Orders: {orders.length}</div>
                    </div>

                    <hr style={{ borderTop: '1px dashed #999' }} />

                    <table style={{ width: '100%', fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>Item</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mergedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.product?.name}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>RM {parseFloat(item.unitPrice).toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>RM {parseFloat(item.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <hr style={{ borderTop: '1px dashed #999' }} />

                    <table style={{ width: '100%', fontSize: 13 }}>
                      <tbody>
                        <tr>
                          <td><strong>Grand Total</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>RM {combinedTotal.toFixed(2)}</strong></td>
                        </tr>
                        {showReceipt && (
                          <>
                            <tr>
                              <td>Payment ({paymentMethod})</td>
                              <td style={{ textAlign: 'right' }}>RM {parseFloat(paymentAmount).toFixed(2)}</td>
                            </tr>
                            {paymentMethod === 'CASH' && change >= 0 && (
                              <tr>
                                <td>Change</td>
                                <td style={{ textAlign: 'right' }}>RM {change.toFixed(2)}</td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>

                    <hr style={{ borderTop: '1px dashed #999' }} />
                    <div className="text-center" style={{ fontSize: 11, color: '#666' }}>
                      *** Thank You, Come Again! ***
                    </div>
                  </div>

                  {/* Payment section — only before receipt */}
                  {!showReceipt && (
                    <div className="mt-3 no-print border-top pt-3">
                      {error && <div className="alert alert-danger py-2">{error}</div>}

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Payment Method</label>
                        <div className="d-flex gap-2">
                          {['CASH', 'CARD', 'EWALLET'].map(m => (
                            <button
                              key={m}
                              className={`btn btn-sm ${paymentMethod === m ? 'btn-dark' : 'btn-outline-dark'}`}
                              onClick={() => handlePaymentMethodChange(m)}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Amount Received <span className="text-muted small">(Total: RM {combinedTotal.toFixed(2)})</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={paymentAmount}
                          onChange={e => setPaymentAmount(e.target.value)}
                          readOnly={paymentMethod !== 'CASH'}
                          min={combinedTotal.toFixed(2)}
                          step="0.01"
                        />
                        {paymentMethod === 'CASH' && paymentAmount && parseFloat(paymentAmount) >= combinedTotal && (
                          <div className="text-success small mt-1">
                            Change: RM {(parseFloat(paymentAmount) - combinedTotal).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer no-print">
              {!showReceipt ? (
                <>
                  <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
                  <button
                    className="btn btn-success"
                    onClick={handleCloseTab}
                    disabled={submitting || loading}
                  >
                    {submitting
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                      : <><i className="bi bi-check-circle me-1"></i>Confirm & Close Tab</>
                    }
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-dark" onClick={handlePrint}>
                    <i className="bi bi-printer me-1"></i>Print Receipt
                  </button>
                  <button className="btn btn-success" onClick={handleDone}>
                    <i className="bi bi-check me-1"></i>Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
