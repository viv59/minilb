import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'

export default function ServerCard({ server, onEdit, onDelete }) {
  console.log(server)
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{server.name}</div>
        {/* <span className="text-xs text-status-green">● {server.status}</span>
        <span className="text-xs text-status-red">● {server.status}</span> */}
        <div>
          {server.status ? <span className="text-xs text-status-green">● {server.status}</span> : <span className="text-xs text-status-red">● {server.status}</span>}
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-text-dim">
        <div className="flex justify-between">
          <span>IP</span>
          <span>
            {server.ip}:{server.port}
          </span>
        </div>
        <div className="flex justify-between">
          <span>CPU</span>
          <span>{server.cpu}%</span>
        </div>
        <div className="flex justify-between">
          <span>Memory</span>
          <span>{server.memory}%</span>
        </div>
        <div className="flex justify-between">
          <span>Requests/min</span>
          <span>{server.reqMin}</span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => onEdit(server.id)}>
          Edit
        </Button>
        <Button variant="danger" className="flex-1" onClick={() => onDelete(server.id)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}
