import { useState } from 'react'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import { useServers } from '../../hooks/useServers.js'
import { useServerUI } from '../../context/ServerContext.jsx'

const TABS = ['Overview', 'Metrics', 'Logs', 'Config']

export default function ServerDetailPanel() {
  const { servers, removeServer } = useServers()
  const { selectedId } = useServerUI()
  const [tab, setTab] = useState('Overview')

  const server = servers.find((s) => s.id === selectedId) ?? servers[0]
  if (!server) return null

  return (
    <Card>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="text-base font-bold">{server.name}</div>
        <span className="rounded-full border border-status-green/40 bg-status-green/10 px-2.5 py-0.5 text-[11px] text-status-green">
          ● {server.status}
        </span>
      </div>

      <div className="mb-4 flex gap-4 border-b border-app-border-soft">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative pb-2.5 text-xs ${
              tab === t
                ? 'text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded after:bg-gradient-to-r after:from-accent1 after:to-accent2'
                : 'text-text-faint'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <div className="text-[12.5px]">
          <Row k="ID" v={server.id} />
          <Row k="Name" v={server.name} />
          <Row k="Status" v={`● ${server.status}`} valueClass="text-status-green" />
          <Row k="IP Address" v={server.ip} />
          <Row k="Port" v={server.port} />
          <Row k="CPU" v={`${server.cpu}%`} bar={server.cpu} />
          <Row k="Memory" v={`${server.memory}%`} bar={server.memory} />
          <Row k="Requests / min" v={server.reqMin} />
          <Row k="Uptime" v={server.uptime} />
          <Row k="Created At" v={server.created} last />
        </div>
      ) : (
        <div className="py-5 text-xs text-text-faint">{tab} view — plug in your own data here.</div>
      )}

      <div className="mt-4 flex gap-2.5">
        <Button variant="outline" className="flex-1">
          Edit
        </Button>
        <Button variant="danger" className="flex-1" onClick={() => removeServer(server.id)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}

function Row({ k, v, bar, valueClass = '', last = false }) {
  return (
    <div className={`flex items-center justify-between py-2 ${last ? '' : 'border-b border-white/5'}`}>
      <span className="text-text-faint">{k}</span>
      <span className={`font-mono text-xs ${valueClass}`}>
        {bar != null && (
          <span className="mr-2 inline-block h-1.5 w-20 overflow-hidden rounded-full bg-white/10 align-middle">
            <span className="block h-full bg-gradient-to-r from-accent1 to-accent2" style={{ width: `${bar}%` }} />
          </span>
        )}
        {v}
      </span>
    </div>
  )
}
