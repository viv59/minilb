export default function ConnectionLine({ d }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="#ffffff30"
      strokeWidth="1.6"
      strokeDasharray="2 6"
      strokeLinecap="round"
      className="animate-dash"
    />
  )
}
