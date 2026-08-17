const VARIANTS = {
  // Primary action: inverted (white on black). No gradients, no glow color.
  primary: 'bg-app-text text-black hover:bg-white',
  // Default secondary action.
  outline: 'border border-app-border text-app-text hover:border-text-dim hover:bg-white/5',
  // Reserved for destructive actions only — the one place red appears by default.
  danger: 'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20',
  // Low-emphasis / tertiary action.
  ghost: 'text-text-dim hover:text-app-text hover:bg-white/5',
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