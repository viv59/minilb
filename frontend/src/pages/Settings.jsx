import Card from '../components/common/Card.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useSettingsStore } from '../store/settingsStore.js'
import { ALGORITHM_OPTIONS } from '../utils/algorithms.js'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const defaultAlgorithm = useSettingsStore((s) => s.defaultAlgorithm)
  const setDefaultAlgorithm = useSettingsStore((s) => s.setDefaultAlgorithm)

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">Settings</h1>

      <Card title="Appearance">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-dim">Theme</span>

          <div className="flex items-center gap-2.5">
            <span className={`text-xs ${theme === 'light' ? 'text-app-text' : 'text-text-faint'}`}>
              Light
            </span>
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
              className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-app-border bg-app-bg transition"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-app-text transition ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs ${theme === 'dark' ? 'text-app-text' : 'text-text-faint'}`}>
              Dark
            </span>
          </div>
        </div>
      </Card>

      <Card title="Simulation Defaults">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-dim">Default algorithm</div>
            <div className="mt-0.5 text-xs text-text-faint">
              Pre-fills the algorithm when you create a new simulation
            </div>
          </div>

          <select
            value={defaultAlgorithm}
            onChange={(e) => setDefaultAlgorithm(e.target.value)}
            className="min-w-[170px] rounded-lg border border-app-border bg-app-bg px-3 py-1.5 text-sm text-app-text focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            {ALGORITHM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Card>
    </div>
  )
}