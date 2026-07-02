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
            className="rounded-lg border border-app-border px-3.5 py-1.5 text-xs text-text-dim hover:text-white"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
        <p className="mt-2.5 text-xs text-text-faint">
          Note: this starter is styled dark-first with fixed colors, not Tailwind's <code>dark:</code> variant, so
          toggling here won't change the look yet — see the note in the summary below for how to wire it up.
        </p>
      </Card>
    </div>
  )
}
