import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'

const MONTHS = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogs','Sep','Okt','Nov','Dis']

export default function PayrollPage() {
  const [tab, setTab] = useState('staff')
  const [staff, setStaff] = useState([])
  const [alert, setAlert] = useState(null)

  // --- Tab 1: Staff & Rate ---
  const [rateModal, setRateModal] = useState(null) // user object
  const [rateInput, setRateInput] = useState('')

  // --- Tab 2: Kehadiran ---
  const [attStaff, setAttStaff] = useState('')
  const [attYear, setAttYear] = useState(new Date().getFullYear())
  const [attMonth, setAttMonth] = useState(new Date().getMonth() + 1)
  const [attendance, setAttendance] = useState([]) // [{date, present}]
  const [attLoading, setAttLoading] = useState(false)

  // --- Tab 3: Bayaran ---
  const [records, setRecords] = useState([])
  const [recLoading, setRecLoading] = useState(false)
  const [calcModal, setCalcModal] = useState(false)
  const [calcForm, setCalcForm] = useState({ userId: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1 })

  useEffect(() => { fetchStaff() }, [])

  async function fetchStaff() {
    try {
      const res = await api.get('/api/payroll/staff')
      setStaff(res.data)
    } catch (err) { console.error(err) }
  }

  // ── Tab 1 helpers ──
  function openRateModal(user) {
    setRateModal(user)
    setRateInput(user.dailyRate || 0)
  }

  async function saveRate(e) {
    e.preventDefault()
    try {
      await api.patch(`/api/payroll/staff/${rateModal.id}/rate`, { dailyRate: parseFloat(rateInput) })
      showAlert('success', `Kadar gaji ${rateModal.fullName} dikemas kini.`)
      setRateModal(null)
      fetchStaff()
    } catch (err) { showAlert('danger', 'Gagal simpan.') }
  }

  // ── Tab 2 helpers ──
  async function fetchAttendance() {
    if (!attStaff) return
    setAttLoading(true)
    try {
      const res = await api.get(`/api/payroll/attendance/${attStaff}/${attYear}/${attMonth}`)
      setAttendance(res.data)
    } catch (err) { console.error(err) }
    finally { setAttLoading(false) }
  }

  useEffect(() => { if (tab === 'attendance' && attStaff) fetchAttendance() }, [attStaff, attYear, attMonth, tab])

  async function toggleDay(dateStr) {
    try {
      await api.post('/api/payroll/attendance/toggle', { userId: String(attStaff), date: dateStr })
      fetchAttendance()
    } catch (err) { showAlert('danger', 'Gagal kemaskini kehadiran.') }
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  function isPresent(dateStr) {
    const rec = attendance.find(a => a.date === dateStr)
    return rec ? rec.present : false
  }

  function hasRecord(dateStr) {
    return attendance.some(a => a.date === dateStr)
  }

  function countPresent() {
    return attendance.filter(a => a.present).length
  }

  // ── Tab 3 helpers ──
  async function fetchRecords() {
    setRecLoading(true)
    try {
      const res = await api.get('/api/payroll/records')
      setRecords(res.data)
    } catch (err) { console.error(err) }
    finally { setRecLoading(false) }
  }

  useEffect(() => { if (tab === 'records') fetchRecords() }, [tab])

  async function handleCalculate(e) {
    e.preventDefault()
    try {
      await api.post('/api/payroll/calculate', {
        userId: parseInt(calcForm.userId),
        year: parseInt(calcForm.year),
        month: parseInt(calcForm.month)
      })
      showAlert('success', 'Gaji berjaya dikira dan disimpan.')
      setCalcModal(false)
      fetchRecords()
    } catch (err) { showAlert('danger', 'Gagal kira gaji.') }
  }

  async function handlePay(id) {
    if (!confirm('Tandakan sebagai DIBAYAR?')) return
    try {
      await api.patch(`/api/payroll/records/${id}/pay`)
      showAlert('success', 'Rekod dikemas kini — gaji dibayar.')
      fetchRecords()
    } catch (err) { showAlert('danger', 'Gagal kemaskini.') }
  }

  function showAlert(type, message) {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3500)
  }

  function monthName(m) { return MONTHS[m - 1] }

  function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-MY') : '-' }

  function fmtRM(n) { return `RM ${parseFloat(n || 0).toFixed(2)}` }

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="Payroll" />

      <div className="container py-4">
        {alert && <div className={`alert alert-${alert.type} alert-dismissible`}>
          {alert.message}
          <button className="btn-close" onClick={() => setAlert(null)} />
        </div>}

        {/* ── Tabs ── */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link ${tab === 'staff' ? 'active fw-semibold' : ''}`} onClick={() => setTab('staff')}>
              <i className="bi bi-people me-1"></i>Staff & Kadar Gaji
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${tab === 'attendance' ? 'active fw-semibold' : ''}`} onClick={() => setTab('attendance')}>
              <i className="bi bi-calendar-check me-1"></i>Rekod Kehadiran
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${tab === 'records' ? 'active fw-semibold' : ''}`} onClick={() => setTab('records')}>
              <i className="bi bi-cash-stack me-1"></i>Bayaran & History
            </button>
          </li>
        </ul>

        {/* ════════════════════ TAB 1: STAFF & RATE ════════════════════ */}
        {tab === 'staff' && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white">
              <i className="bi bi-people me-2"></i>Senarai Staff & Kadar Gaji Harian
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-secondary">
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Jawatan</th>
                    <th>Kadar Gaji Harian</th>
                    <th>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">Tiada staff.</td></tr>
                  ) : staff.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{u.fullName}</td>
                      <td className="text-muted">{u.username}</td>
                      <td>
                        <span className={`badge bg-${u.role === 'ADMIN' ? 'dark' : 'primary'}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-success">{fmtRM(u.dailyRate)}</span>
                        <span className="text-muted small ms-1">/ hari</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-dark" onClick={() => openRateModal(u)}>
                          <i className="bi bi-pencil me-1"></i>Set Gaji
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 2: KEHADIRAN ════════════════════ */}
        {tab === 'attendance' && (
          <div>
            {/* Filter */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Pilih Staff</label>
                    <select className="form-select" value={attStaff} onChange={e => setAttStaff(e.target.value)}>
                      <option value="">-- Pilih Staff --</option>
                      {staff.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Bulan</label>
                    <select className="form-select" value={attMonth} onChange={e => setAttMonth(parseInt(e.target.value))}>
                      {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Tahun</label>
                    <input className="form-control" type="number" value={attYear}
                      onChange={e => setAttYear(parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>

            {!attStaff ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-person-x fs-1 d-block mb-2"></i>
                Pilih staff untuk lihat kehadiran.
              </div>
            ) : attLoading ? (
              <div className="text-center py-5"><div className="spinner-border text-secondary"></div></div>
            ) : (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                  <span>
                    <i className="bi bi-calendar3 me-2"></i>
                    Kehadiran {staff.find(u => u.id == attStaff)?.fullName} — {monthName(attMonth)} {attYear}
                  </span>
                  <span className="badge bg-success fs-6">
                    {countPresent()} hari hadir
                  </span>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    {Array.from({ length: getDaysInMonth(attYear, attMonth) }, (_, i) => {
                      const day = i + 1
                      const dateStr = `${attYear}-${String(attMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const present = isPresent(dateStr)
                      const recorded = hasRecord(dateStr)
                      return (
                        <div className="col-4 col-sm-3 col-md-2" key={day}>
                          <button
                            className={`btn w-100 btn-${present ? 'success' : recorded ? 'danger' : 'outline-secondary'}`}
                            onClick={() => toggleDay(dateStr)}
                            title={present ? 'Hadir — klik untuk tukar' : 'Tidak hadir — klik untuk tandakan hadir'}
                          >
                            <div className="fw-bold">{day}</div>
                            <div style={{ fontSize: '0.65rem' }}>
                              {present ? 'Hadir' : recorded ? 'Absent' : '-'}
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-muted small mt-3 mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Klik pada tarikh untuk togel hadir / tidak hadir.
                    <span className="ms-3">🟢 Hadir &nbsp; 🔴 Tidak hadir &nbsp; ⬜ Belum direkod</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════ TAB 3: RECORDS ════════════════════ */}
        {tab === 'records' && (
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-dark" onClick={() => setCalcModal(true)}>
                <i className="bi bi-calculator me-1"></i>Kira Gaji
              </button>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white">
                <i className="bi bi-cash-stack me-2"></i>History Pembayaran Gaji
              </div>
              <div className="card-body p-0">
                {recLoading ? (
                  <div className="text-center py-5"><div className="spinner-border text-secondary"></div></div>
                ) : (
                  <table className="table table-hover mb-0">
                    <thead className="table-secondary">
                      <tr>
                        <th>#</th>
                        <th>Nama Staff</th>
                        <th>Bulan</th>
                        <th>Hari Kerja</th>
                        <th>Kadar/Hari</th>
                        <th>Jumlah Gaji</th>
                        <th>Status</th>
                        <th>Tarikh Bayar</th>
                        <th>Tindakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr><td colSpan={9} className="text-center text-muted py-4">
                          Tiada rekod. Klik "Kira Gaji" untuk mula.
                        </td></tr>
                      ) : records.map((r, i) => (
                        <tr key={r.id}>
                          <td>{i + 1}</td>
                          <td className="fw-semibold">{r.user?.fullName}</td>
                          <td>{monthName(r.month)} {r.year}</td>
                          <td className="text-center">{r.daysWorked} hari</td>
                          <td>{fmtRM(r.dailyRate)}</td>
                          <td className="fw-bold text-success">{fmtRM(r.totalAmount)}</td>
                          <td>
                            <span className={`badge bg-${r.paid ? 'success' : 'warning text-dark'}`}>
                              {r.paid ? 'Dibayar' : 'Belum Bayar'}
                            </span>
                          </td>
                          <td className="small text-muted">{fmtDate(r.paidDate)}</td>
                          <td>
                            {!r.paid && (
                              <button className="btn btn-sm btn-success" onClick={() => handlePay(r.id)}>
                                <i className="bi bi-check-lg me-1"></i>Bayar
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
        )}
      </div>

      {/* ── Modal: Set Rate ── */}
      {rateModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Set Gaji Harian</h5>
                <button className="btn-close" onClick={() => setRateModal(null)} />
              </div>
              <form onSubmit={saveRate}>
                <div className="modal-body">
                  <p className="text-muted mb-3">Staff: <strong>{rateModal.fullName}</strong></p>
                  <label className="form-label fw-semibold">Kadar Gaji Harian (RM)</label>
                  <div className="input-group">
                    <span className="input-group-text">RM</span>
                    <input className="form-control" type="number" min="0" step="0.01"
                      required value={rateInput} onChange={e => setRateInput(e.target.value)} />
                    <span className="input-group-text">/ hari</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setRateModal(null)}>Batal</button>
                  <button type="submit" className="btn btn-dark">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Kira Gaji ── */}
      {calcModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-calculator me-2"></i>Kira Gaji</h5>
                <button className="btn-close" onClick={() => setCalcModal(false)} />
              </div>
              <form onSubmit={handleCalculate}>
                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Sistem akan kira gaji berdasarkan hari hadir × kadar gaji harian.
                    Kalau rekod untuk bulan ini dah ada, ia akan dikemas kini.
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Staff</label>
                    <select className="form-select" required value={calcForm.userId}
                      onChange={e => setCalcForm({ ...calcForm, userId: e.target.value })}>
                      <option value="">-- Pilih Staff --</option>
                      {staff.map(u => <option key={u.id} value={u.id}>{u.fullName} ({fmtRM(u.dailyRate)}/hari)</option>)}
                    </select>
                  </div>
                  <div className="row g-3">
                    <div className="col">
                      <label className="form-label fw-semibold">Bulan</label>
                      <select className="form-select" value={calcForm.month}
                        onChange={e => setCalcForm({ ...calcForm, month: parseInt(e.target.value) })}>
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                      </select>
                    </div>
                    <div className="col">
                      <label className="form-label fw-semibold">Tahun</label>
                      <input className="form-control" type="number" value={calcForm.year}
                        onChange={e => setCalcForm({ ...calcForm, year: parseInt(e.target.value) })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setCalcModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-dark">
                    <i className="bi bi-calculator me-1"></i>Kira & Simpan
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
