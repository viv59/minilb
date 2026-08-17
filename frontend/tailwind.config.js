/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        'app-bg': '#000000',
        'app-panel': '#101010',
        'app-panel-soft': '#161616',

        // Borders
        'app-border': '#2a2a2a',
        'app-border-soft': '#1a1a1a',

        // Text
        'app-text': '#f5f5f5',
        'text-dim': '#a3a3a3',
        'text-faint': '#6b6b6b',

        // Accent — reserved for destructive actions, error states, and the
        // occasional deliberate emphasis. Do not use for default primary
        // buttons, links, or decoration.
        accent: '#ef4444',
        'accent-hover': '#dc2626',

        // Status colors — EXCEPTION to the monochrome rule, scoped
        // specifically to server/health indicators (ServerNode and
        // anywhere else representing live status). Traffic-light color is
        // load-bearing there. Do not use these for buttons, toasts, focus
        // states, or general UI — use `accent` for those instead.
        'status-green': '#34d399',
        'status-yellow': '#fbbf24',
        'status-red': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}