import Card from '../common/Card.jsx'
import { useTraffic } from '../../hooks/useTraffic.js'
import { useCountUp } from '../../hooks/useAnimation.js'

// Static-looking wiggly line. Swap for real historical samples of
// totalRequests (e.g. last 20 polls) once you have a metrics feed.
const SPARK_Y = [30, 22, 26, 18, 24, 15, 20, 10, 16, 8, 12, 4]
function sparklinePoints() {
  return SPARK_Y.map((y, i) => `${i * (240 / (SPARK_Y.length - 1))},${y + 10}`).join(' ')
}

export default function LiveTrafficCard() {
  const { totalRequests } = useTraffic()
  const animated = useCountUp(totalRequests)

  return (
    <Card title="Live Traffic">
      <div className="text-[11px] text-text-faint">Requests / min</div>
      <div className="my-1 flex items-baseline gap-2 text-3xl font-bold">
        {animated.toLocaleString()}
        <span className="text-xs font-semibold text-status-green">↑ 12.5%</span>
      </div>
      <svg className="mt-2.5 h-14 w-full" viewBox="0 0 240 60" preserveAspectRatio="none">
        <polyline points={sparklinePoints()} fill="none" stroke="url(#sparkGrad)" strokeWidth="2" />
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#4fd1ff" />
          </linearGradient>
        </defs>
      </svg>
    </Card>
  )
}
