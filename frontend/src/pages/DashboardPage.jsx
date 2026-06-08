import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TopNav from '../components/TopNav'

export default function DashboardPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await api.post('/logout')
    navigate('/login')
  }

  const modules = [
    { icon: 'bi-box-seam', label: 'Products', path: '/products', color: 'primary' },
    { icon: 'bi-tags', label: 'Categories', path: '/categories', color: 'success' },
    { icon: 'bi-people', label: 'Customers', path: '/customers', color: 'info' },
    { icon: 'bi-archive', label: 'Inventory', path: '/inventory', color: 'warning' },
    { icon: 'bi-cart', label: 'Sales', path: '/sales', color: 'danger' },
    { icon: 'bi-graph-up', label: 'Reports', path: '/reports', color: 'secondary' },
    { icon: 'bi-people-fill', label: 'Users', path: '/users', color: 'dark' },
    { icon: 'bi-bell', label: 'Orders', path: '/orders', color: 'warning' },
    { icon: 'bi-qr-code', label: 'Tables', path: '/tables', color: 'dark' },
    { icon: 'bi-cash-coin', label: 'Payroll', path: '/payroll', color: 'success' },
  ]

  return (
    <div className="min-vh-100 bg-light">
      <TopNav
        linkToDashboard={false}
        right={
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>Logout
          </button>
        }
      />

      <div className="container py-5">
        <h4 className="fw-bold mb-1">Dashboard</h4>
        <p className="text-muted mb-4">Welcome back! Select a module to get started.</p>

        <div className="row g-4">
          {modules.map(m => (
            <div className="col-6 col-md-4 col-lg-2" key={m.path}>
              <div
                className="card text-center shadow-sm h-100 border-0"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(m.path)}
              >
                <div className="card-body py-4">
                  <div className={`text-${m.color} mb-2`}>
                    <i className={`bi ${m.icon} fs-1`}></i>
                  </div>
                  <p className="fw-semibold mb-0 small">{m.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
