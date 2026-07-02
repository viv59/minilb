export default function Card({ title, action, className = '', children }) {
  return (
    <div className={`rounded-2xl border border-app-border-soft bg-app-panel p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-app-text">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
