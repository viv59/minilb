import Card from '../common/Card.jsx'
import { useServers } from '../../hooks/useServers.js'

export default function ServerStats() {
  const { servers } = useServers()

  return (
    <Card title="Servers">
      {servers.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between border-b border-app-border-soft py-2.5 text-[12.5px] last:border-none"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
            {s.name}
          </span>
          <span className="text-text-faint">{s.reqMin} req/min</span>
        </div>
      ))}
    </Card>
  )
}
