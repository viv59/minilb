const VARIANTS = {
  // Primary action: inverted relative to current theme.
  // bg-app-text + text-app-bg auto-flips correctly in both themes.
  primary: 'bg-app-text text-app-bg hover:opacity-90',

  // Secondary action: subtle filled surface.
  secondary:
    'bg-app-panel-soft text-app-text border border-app-border hover:bg-app-text/10',

  // Default secondary/outlined action.
  outline:
    'border border-app-border text-app-text hover:border-text-dim hover:bg-app-text/5',

  // Reserved for destructive actions only.
  danger:
    'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20',

  // Low-emphasis / tertiary action.
  ghost:
    'text-text-dim hover:text-app-text hover:bg-app-text/5',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}