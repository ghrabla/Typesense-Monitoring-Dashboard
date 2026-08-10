import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="sidebar">
      <h1 className="sidebar__title">Typesense Dashboard</h1>
      <nav className="sidebar__nav">
        <NavLink to="/dashboard" className="sidebar__link">
          Dashboard
        </NavLink>
      </nav>
      <button type="button" className="sidebar__logout" onClick={() => void logout()}>
        Logout
      </button>
    </aside>
  )
}
