import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button.jsx'

const QUICK_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/servers', label: 'Servers' },
  { to: '/algorithms', label: 'Algorithms' },
  { to: '/simulation-logs', label: 'Simulation Logs' },
]

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-app-bg px-6 text-center text-app-text">
      {/* oversized, low-contrast numeral — a design flourish that stays
          within the theme (app-border gray, not an accent color) */}
      <div className="select-none font-mono text-7xl font-bold leading-none tracking-tight text-app-border sm:text-8xl">
        404
      </div>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-text-dim">
        The page you're looking for was moved, renamed, or never existed in miniLB.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-1.5">
          <ArrowLeft size={15} /> Go back
        </Button>
        <Link to="/dashboard">
          <Button>Open Dashboard</Button>
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-app-border-soft pt-6 text-xs text-text-faint">
        {QUICK_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-app-text hover:underline">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}