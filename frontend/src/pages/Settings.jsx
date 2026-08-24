import Card from '../components/common/Card.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Settings</h1>
      <Card title="Appearance">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-dim">Theme</span>
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-app-border px-3.5 py-1.5 text-xs text-text-dim hover:text-app-text"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </Card>
    </div>
  )
}