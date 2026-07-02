/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'app-bg': '#0a0c17',
        'app-panel': '#12152a',
        'app-border': '#242848',
        'app-border-soft': '#1b1e38',
        'app-text': '#e7e9f7',
        'text-dim': '#8a8fb3',
        'text-faint': '#5b5f82',
        accent1: '#7c5cff',
        accent2: '#4fd1ff',
        'status-green': '#34d399',
        'status-red': '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
