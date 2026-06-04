import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import TopNav from '../components/TopNav'

export default function TablesPage() {
  const [tableCount, setTableCount] = useState(5)
  const [inputCount, setInputCount] = useState(5)
  const [printTable, setPrintTable] = useState(null)

  const baseUrl = window.location.origin

  function handlePrintQR(tableNumber) {
    setPrintTable(tableNumber)
    setTimeout(() => {
      window.print()
      setPrintTable(null)
    }, 300)
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print, #qr-print * { visibility: visible; }
          #qr-print {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
          }
        }
      `}</style>

      {/* Hidden print area */}
      {printTable && (
        <div id="qr-print" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2 style={{ marginBottom: 8 }}>Warung Orang Lama</h2>
            <p style={{ marginBottom: 16, color: '#666' }}>Scan to order</p>
            <QRCodeSVG value={`${baseUrl}/menu/${printTable}`} size={200} />
            <h3 style={{ marginTop: 16 }}>Table {printTable}</h3>
          </div>
        </div>
      )}

      <div className="min-vh-100 bg-light">
        <TopNav title="Table QR Codes" />

        <div className="container py-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body d-flex align-items-center gap-3">
              <label className="fw-semibold mb-0">Number of Tables:</label>
              <input
                type="number"
                className="form-control"
                style={{ width: 100 }}
                min={1}
                max={50}
                value={inputCount}
                onChange={e => setInputCount(parseInt(e.target.value) || 1)}
              />
              <button className="btn btn-dark" onClick={() => setTableCount(inputCount)}>
                Apply
              </button>
            </div>
          </div>

          <div className="row g-4">
            {Array.from({ length: tableCount }, (_, i) => i + 1).map(tableNumber => (
              <div className="col-6 col-md-4 col-lg-3" key={tableNumber}>
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body py-4">
                    <h5 className="fw-bold mb-3">Table {tableNumber}</h5>
                    <div className="d-flex justify-content-center mb-3">
                      <QRCodeSVG
                        value={`${baseUrl}/menu/${tableNumber}`}
                        size={140}
                      />
                    </div>
                    <p className="text-muted small mb-3" style={{ wordBreak: 'break-all', fontSize: 10 }}>
                      {baseUrl}/menu/{tableNumber}
                    </p>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-dark btn-sm"
                        onClick={() => handlePrintQR(tableNumber)}
                      >
                        <i className="bi bi-printer me-1"></i>Print QR
                      </button>
                      <button
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => window.open(`${baseUrl}/menu/${tableNumber}`, '_blank')}
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
