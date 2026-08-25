/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'app-bg': 'var(--color-bg)',
        'app-panel': 'var(--color-panel)',
        'app-panel-soft': 'var(--color-panel-soft)',

        'app-border': 'var(--color-border)',
        'app-border-soft': 'var(--color-border-soft)',

        'app-text': 'var(--color-text)',
        'text-dim': 'var(--color-text-dim)',
        'text-faint': 'var(--color-text-faint)',

        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-purple': 'var(--color-accent-purple)',

        'status-green': 'var(--color-status-green)',
        'status-yellow': 'var(--color-status-yellow)',
        'status-red': 'var(--color-status-red)',
      },
            fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}