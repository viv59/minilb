import { CheckCircle2, AlertTriangle } from 'lucide-react'
import Card from '../common/Card.jsx'
import { useServers } from '../../hooks/useServers.js'

export default function HealthSummary() {
  const { servers } = useServers()
  const healthy = servers.filter((s) => s.status === 'Healthy').length
  const unhealthy = servers.length - healthy

  return (
    <Card title="Health Summary">
      <div className="flex items-center gap-2 py-1.5 text-sm">
        <CheckCircle2 size={16} className="text-status-green" />
        <span>{healthy} healthy</span>
      </div>
      <div className="flex items-center gap-2 py-1.5 text-sm">
        <AlertTriangle size={16} className="text-status-red" />
        <span>{unhealthy} unhealthy</span>
      </div>
    </Card>
  )
}
