import { useEffect, useState } from 'react'
import api from '../api/axios'
import TopNav from '../components/TopNav'
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#6c757d']

// Small reusable wrapper so every chart card looks the same
function ChartCard({ title, icon, children, empty }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white fw-semibold">
        {icon && <i className={`bi ${icon} me-2`}></i>}{title}
      </div>
      <div className="card-body">
        {empty
          ? <div className="text-center text-muted py-5">No data yet.</div>
          : children}
      </div>
    </div>
  )
}

function TrendBadge({ percent }) {
  if (percent === 0) return <span className="badge bg-secondary">—</span>
  const up = percent > 0
  return (
    <span className={`badge bg-${up ? 'success' : 'danger'}`}>
      <i className={`bi bi-arrow-${up ? 'up' : 'down'} me-1`}></i>
      {Math.abs(percent)}%
    </span>
  )
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [summary, setSummary] = useState(null)
  const [stats, setStats] = useState(null)
  const [salesByDay, setSalesByDay] = useState([])
  const [peakHours, setPeakHours] = useState([])
  const [categorySales, setCategorySales] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [leastProducts, setLeastProducts] = useState([])
  const [staff, setStaff] = useState([])
  const [frequentCustomers, setFrequentCustomers] = useState([])
  const [newVsReturning, setNewVsReturning] = useState([])
  const [sales, setSales] = useState([])

  useEffect(() => {
    // Fetch each endpoint independently — one failure won't break the rest.
    // (A 401 is handled globally by the axios interceptor.)
    const safeGet = (url) => api.get(url).then(r => r.data).catch(() => null)

    Promise.all([
      safeGet('/api/analytics/summary'),
      safeGet('/api/reports/stats'),
      safeGet('/api/analytics/sales-by-day'),
      safeGet('/api/analytics/peak-hours'),
      safeGet('/api/analytics/category-sales'),
      safeGet('/api/analytics/top-products?limit=5'),
      safeGet('/api/analytics/least-products?limit=5'),
      safeGet('/api/analytics/staff-performance'),
      safeGet('/api/analytics/frequent-customers?limit=5'),
      safeGet('/api/analytics/customers-new-vs-returning'),
      safeGet('/api/reports/sales'),
    ]).then(([sum, st, byDay, peak, cat, top, least, stf, freq, nvr, sl]) => {
      setSummary(sum)
      setStats(st)
      setSalesByDay(byDay || [])
      setPeakHours(peak || [])
      setCategorySales(cat || [])
      setTopProducts(top || [])
      setLeastProducts(least || [])
      setStaff(stf || [])
      setFrequentCustomers(freq || [])
      setNewVsReturning(nvr || [])
      setSales(sl || [])
      if (!sum && !st) setError('Could not load reports. Make sure the backend is running, then refresh.')
    }).finally(() => setLoading(false))
  }, [])

  function formatDate(dt) {
    return new Date(dt).toLocaleString('en-MY')
  }

  function money(v) {
    return 'RM ' + parseFloat(v || 0).toFixed(2)
  }

  function exportCSV() {
    const headers = ['Sale ID', 'Date', 'Customer', 'Cashier', 'Items', 'Total (RM)', 'Payment Method', 'Status']
    const rows = sales.map(s => [
      s.id,
      formatDate(s.createdAt),
      s.customer?.name || 'Walk-in',
      s.user?.fullName || s.user?.username,
      s.items?.length,
      parseFloat(s.totalAmount).toFixed(2),
      s.paymentMethod,
      s.status,
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sales_report_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-secondary"></div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <TopNav title="Reports & Analytics" />

      <div className="container py-4">
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        {/* ===== Summary cards ===== */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3 h-100">
              <div className="text-success fs-4 fw-bold">{money(summary?.todayRevenue)}</div>
              <div className="text-muted small">Today's Revenue</div>
              <div className="small text-muted">{summary?.todayCount || 0} sales</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3 h-100">
              <div className="text-success fs-4 fw-bold">{money(summary?.weekRevenue)}</div>
              <div className="text-muted small">This Week {summary && <TrendBadge percent={summary.weekTrendPercent} />}</div>
              <div className="small text-muted">{summary?.weekCount || 0} sales</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3 h-100">
              <div className="text-success fs-4 fw-bold">{money(summary?.monthRevenue)}</div>
              <div className="text-muted small">This Month {summary && <TrendBadge percent={summary.monthTrendPercent} />}</div>
              <div className="small text-muted">{summary?.monthCount || 0} sales</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3 h-100">
              <div className="text-danger fs-4 fw-bold">{stats?.lowStockCount || 0}</div>
              <div className="text-muted small">Low Stock Items</div>
              <div className="small text-muted">{stats?.totalProducts || 0} products · {stats?.totalCustomers || 0} customers</div>
            </div>
          </div>
        </div>

        {/* ===== Charts ===== */}
        <div className="row g-3 mb-3">
          <div className="col-lg-6">
            <ChartCard title="Sales by Day of Week" icon="bi-calendar-week" empty={salesByDay.length === 0}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Bar dataKey="value" name="Revenue" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-lg-6">
            <ChartCard title="Peak Hours" icon="bi-clock-history" empty={peakHours.length === 0}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Line type="monotone" dataKey="value" name="Revenue" stroke="#198754" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-lg-6">
            <ChartCard title="Sales by Category" icon="bi-pie-chart" empty={categorySales.length === 0}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categorySales} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                    {categorySales.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-lg-6">
            <ChartCard title="New vs Returning Customers" icon="bi-people" empty={newVsReturning.every(d => d.value === 0)}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={newVsReturning} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                    {newVsReturning.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-lg-6">
            <ChartCard title="Top Selling Items (qty)" icon="bi-trophy" empty={topProducts.length === 0}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="label" width={100} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" name="Qty sold" fill="#198754" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-lg-6">
            <ChartCard title="Least Selling Items (qty)" icon="bi-graph-down" empty={leastProducts.length === 0}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leastProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="label" width={100} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" name="Qty sold" fill="#dc3545" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* ===== Staff + Customers tables ===== */}
        <div className="row g-3 mb-4">
          <div className="col-lg-6">
            <ChartCard title="Staff Performance" icon="bi-person-badge" empty={staff.length === 0}>
              <table className="table table-sm table-hover mb-0">
                <thead><tr><th>Cashier</th><th className="text-end">Sales</th><th className="text-end">Revenue</th></tr></thead>
                <tbody>
                  {staff.map((s, i) => (
                    <tr key={i}>
                      <td>{i === 0 && <i className="bi bi-star-fill text-warning me-1"></i>}{s.name}</td>
                      <td className="text-end">{s.salesCount}</td>
                      <td className="text-end fw-semibold">{money(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ChartCard>
          </div>
          <div className="col-lg-6">
            <ChartCard title="Most Frequent Customers" icon="bi-star" empty={frequentCustomers.length === 0}>
              <table className="table table-sm table-hover mb-0">
                <thead><tr><th>Customer</th><th className="text-end">Visits</th><th className="text-end">Total Spent</th></tr></thead>
                <tbody>
                  {frequentCustomers.map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td className="text-end">{c.visits}</td>
                      <td className="text-end fw-semibold">{money(c.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ChartCard>
          </div>
        </div>

        {/* ===== All Sales table + CSV ===== */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">All Sales</h5>
          <button className="btn btn-success btn-sm" onClick={exportCSV}>
            <i className="bi bi-file-earmark-excel me-1"></i>Export CSV
          </button>
        </div>
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th><th>Date</th><th>Customer</th><th>Cashier</th>
                  <th>Items</th><th>Total</th><th>Payment</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted py-4">No sales yet.</td></tr>
                ) : sales.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td className="small">{formatDate(s.createdAt)}</td>
                    <td>{s.customer?.name || <span className="text-muted">Walk-in</span>}</td>
                    <td>{s.user?.fullName || s.user?.username}</td>
                    <td>{s.items?.length}</td>
                    <td className="fw-semibold">{money(s.totalAmount)}</td>
                    <td><span className="badge bg-secondary">{s.paymentMethod}</span></td>
                    <td>
                      <span className={`badge bg-${s.status === 'COMPLETED' ? 'success' : 'danger'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
