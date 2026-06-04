export default function ReceiptModal({ sale, onClose }) {
  if (!sale) return null

  function handlePrint() {
    window.print()
  }

  function formatDate(dt) {
    return new Date(dt).toLocaleString('en-MY')
  }

  return (
    <>
      {/* Print styles — only receipt is visible when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt {
            position: fixed;
            top: 0; left: 0;
            width: 80mm;
            padding: 10px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header no-print">
              <h5 className="modal-title">Receipt — Sale #{sale.id}</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Receipt content */}
              <div id="receipt" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                <div className="text-center mb-2">
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>WARUNG ORANG LAMA</div>
                  <div style={{ fontSize: 11, color: '#666' }}>Thank you for your purchase!</div>
                  <hr style={{ borderTop: '1px dashed #999' }} />
                </div>

                <div style={{ fontSize: 11, marginBottom: 8 }}>
                  <div>Receipt #: {sale.id}</div>
                  <div>Date: {formatDate(sale.createdAt)}</div>
                  <div>Cashier: {sale.user?.fullName || sale.user?.username}</div>
                  {sale.customer && <div>Customer: {sale.customer.name}</div>}
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
                    {sale.items?.map(item => (
                      <tr key={item.id}>
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
                      <td><strong>Total</strong></td>
                      <td style={{ textAlign: 'right' }}><strong>RM {parseFloat(sale.totalAmount).toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                      <td>Payment ({sale.paymentMethod})</td>
                      <td style={{ textAlign: 'right' }}>RM {parseFloat(sale.paymentAmount).toFixed(2)}</td>
                    </tr>
                    {sale.changeAmount >= 0 && (
                      <tr>
                        <td>Change</td>
                        <td style={{ textAlign: 'right' }}>RM {parseFloat(sale.changeAmount).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {sale.notes && (
                  <>
                    <hr style={{ borderTop: '1px dashed #999' }} />
                    <div style={{ fontSize: 11 }}>Note: {sale.notes}</div>
                  </>
                )}

                <hr style={{ borderTop: '1px dashed #999' }} />
                <div className="text-center" style={{ fontSize: 11, color: '#666' }}>
                  *** Thank You, Come Again! ***
                </div>
              </div>
            </div>

            <div className="modal-footer no-print">
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
              <button className="btn btn-dark" onClick={handlePrint}>
                <i className="bi bi-printer me-1"></i>Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
