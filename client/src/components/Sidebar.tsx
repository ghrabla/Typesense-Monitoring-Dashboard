import { NavLink } from 'react-router-dom'
import {
  Database,
  Link2,
  ListTree,
  KeyRound,
  ServerCog,
  SlidersHorizontal,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/collections', label: 'Collections', icon: Database },
  { to: '/aliases', label: 'Aliases', icon: Link2 },
  { to: '/synonyms', label: 'Synonyms', icon: ListTree },
  { to: '/overrides', label: 'Overrides', icon: SlidersHorizontal },
  { to: '/api-keys', label: 'API Keys', icon: KeyRound },
  { to: '/server', label: 'Server', icon: ServerCog },
]

export function Sidebar() {
  const { logout, username } = useAuth()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
          T
        </div>
        <div className="text-sm font-semibold text-slate-900">Typesense Console</div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100/80 hover:text-slate-900',
                isActive && 'bg-slate-900 text-white shadow-sm hover:bg-slate-900 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200/70 p-3">
        {username && (
          <div className="mb-2 truncate px-2 text-xs text-slate-400">
            Signed in as <span className="font-medium text-slate-600">{username}</span>
          </div>
        )}
        <button
          onClick={() => void logout()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
