const VARIANTS = {
  primary: 'bg-gradient-to-br from-accent1 to-[#5a3fe0] text-white shadow-lg shadow-accent1/30 hover:brightness-110',
  outline: 'border border-app-border text-app-text hover:border-[#3a3f66]',
  danger: 'border border-status-red/40 bg-status-red/10 text-status-red hover:bg-status-red/20',
  ghost: 'text-text-dim hover:text-white hover:bg-white/5',
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
