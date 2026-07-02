export default function Loader({ size = 20 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white/20 border-t-accent2"
      style={{ width: size, height: size }}
    />
  )
}
