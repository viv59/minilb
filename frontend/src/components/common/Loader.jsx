export default function Loader({ size = 20 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-app-text/15 border-t-app-text"
      style={{ width: size, height: size }}
    />
  )
}