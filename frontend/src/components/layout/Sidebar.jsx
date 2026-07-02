import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Server, GitBranch, Activity, Settings as SettingsIcon, Hexagon } from 'lucide-react'
import { NAV_ITEMS } from '../../utils/constants.js'
import { useServerStore } from '../../store/serverStore.js'
import { ALGORITHMS } from '../../utils/algorithms.js'

const ICONS = { LayoutDashboard, Server, GitBranch, Activity, Settings: SettingsIcon }

export default function Sidebar() {
  const algorithmIndex = useServerStore((s) => s.algorithmIndex)
  const cycleAlgorithm = useServerStore((s) => s.cycleAlgorithm)

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col gap-1.5 border-r border-app-border-soft p-3.5">
      <div className="flex items-center gap-2.5 px-2 pb-5 pt-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent1 to-accent2">
          <Hexagon size={16} className="text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">LoadBalancer Pro</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon]
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] transition ${
                isActive
                  ? 'border border-accent1/40 bg-gradient-to-r from-accent1/20 to-accent2/10 text-white'
                  : 'text-text-dim hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} /> {item.label}
          </NavLink>
        )
      })}

      <div className="mt-auto rounded-xl border border-app-border-soft bg-app-panel p-3.5">
        <div className="text-[11px] uppercase tracking-wide text-text-faint">Current Algorithm</div>
        <div className="my-1 text-[13.5px] font-semibold text-accent1">{ALGORITHMS[algorithmIndex].name}</div>
        <button
          onClick={cycleAlgorithm}
          className="w-full rounded-lg border border-app-border py-1.5 text-xs text-text-dim hover:border-[#3a3f66] hover:text-white"
        >
          Change
        </button>
      </div>
    </aside>
  )
}
