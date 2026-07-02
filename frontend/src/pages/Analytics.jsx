import Card from '../components/common/Card.jsx'
import TrafficDonut from '../components/dashboard/TrafficDonut.jsx'
import HealthSummary from '../components/dashboard/HealthSummary.jsx'
import { useTraffic } from '../hooks/useTraffic.js'

export default function Analytics() {
  const { distribution } = useTraffic()

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Analytics</h1>
      <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
        <TrafficDonut />
        <HealthSummary />
        <Card title="Requests per Server" className="col-span-2 max-[900px]:col-span-1">
          <div className="flex h-40 items-end gap-3.5">
            {distribution.map((d) => (
              <div key={d.id} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md" style={{ height: `${d.pct * 2}px`, background: d.color }} />
                <span className="text-[10px] text-text-faint">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
