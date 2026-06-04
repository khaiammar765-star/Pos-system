import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import CustomersPage from './pages/CustomersPage'
import InventoryPage from './pages/InventoryPage'
import SalesPage from './pages/SalesPage'
import CheckoutPage from './pages/CheckoutPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import MenuPage from './pages/MenuPage'
import OrdersPage from './pages/OrdersPage'
import TablesPage from './pages/TablesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes (no login needed) ── */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/menu/:tableNumber" element={<MenuPage />} />

        {/* ── Protected staff routes (require login) ── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/tables" element={<ProtectedRoute><TablesPage /></ProtectedRoute>} />

        {/* ── Admin-only route ── */}
        <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
