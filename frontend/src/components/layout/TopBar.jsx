import { useEffect, useRef, useState } from 'react'
import { Plus, LogOut } from 'lucide-react'
import Button from '../common/Button.jsx'
import { useServerUI } from '../../context/ServerContext.jsx'
import { useAuthStore } from '../../store/authStore.js'

export default function TopBar() {
  const { openAddModal } = useServerUI()
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="flex items-center justify-end gap-3.5 border-b border-app-border-soft px-6 py-4">
      <div className="rounded-lg border border-app-border-soft bg-app-panel px-3.5 py-1.5 text-center text-[11px] text-text-faint">
        System Status
        <div className="text-[13px] font-semibold text-status-green">Healthy</div>
      </div>

      {isAdmin && (
        <Button onClick={openAddModal} className="flex items-center gap-1.5">
          <Plus size={15} /> Add Server
        </Button>
      )}

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-app-border-soft bg-app-panel text-xs font-bold text-text-dim transition hover:border-accent1/50"
          title={user ? `${user.name} (${user.role})` : 'Not signed in'}
        >
          {initials}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl border border-app-border-soft bg-app-panel p-2 shadow-lg">
            <div className="border-b border-app-border-soft px-2 pb-2">
              <div className="truncate text-sm font-semibold text-app-text">{user?.name ?? 'Unknown'}</div>
              <div className="truncate text-xs text-text-faint">{user?.email}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-accent2">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-status-red transition hover:bg-status-red/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}