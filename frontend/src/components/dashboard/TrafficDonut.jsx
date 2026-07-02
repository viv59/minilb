import Card from '../common/Card.jsx'
import { useTraffic } from '../../hooks/useTraffic.js'

export default function TrafficDonut() {
  const { totalRequests, distribution } = useTraffic()
  const gradient = `conic-gradient(${distribution.map((d) => `${d.color} ${d.start}% ${d.end}%`).join(',')})`

  return (
    <Card title="Traffic Distribution">
      <div className="flex items-center gap-4">
        <div className="relative h-[140px] w-[140px] flex-shrink-0 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-6 rounded-full bg-app-panel" />
        </div>
        <div className="flex flex-col gap-2.5 text-xs">
          {distribution.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-text-dim">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
              <span>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-between border-t border-app-border-soft pt-3.5 text-sm">
        <span className="text-text-faint">Total Requests / min</span>
        <span className="text-xl font-bold">{totalRequests.toLocaleString()}</span>
      </div>
    </Card>
  )
}
