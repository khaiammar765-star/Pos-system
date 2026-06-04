import { useNavigate } from 'react-router-dom'

/**
 * Shared top navigation bar for all staff pages.
 * Defined once here so the logo, branding and styling live in a single place.
 *
 * Props:
 *  - title: right-side label text (e.g. "Products")
 *  - right: custom right-side content (e.g. a Logout button) — overrides `title`
 *  - linkToDashboard: clicking the logo returns to the dashboard (default true)
 */
export default function TopNav({ title, right, linkToDashboard = true }) {
  const navigate = useNavigate()
  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <span
        className="navbar-brand fw-bold mb-0"
        style={{ cursor: linkToDashboard ? 'pointer' : 'default' }}
        onClick={() => { if (linkToDashboard) navigate('/dashboard') }}
      >
        <img src="/logo.png" alt="Warung Orang Lama" style={{ height: 52 }} />
      </span>
      {right || (title && <span className="text-white fw-semibold">{title}</span>)}
    </nav>
  )
}
