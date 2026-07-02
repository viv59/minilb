import { useMemo, useState } from 'react'
import { Pencil, Trash2, Search } from 'lucide-react'
import Card from '../common/Card.jsx'
import { useServers } from '../../hooks/useServers.js'
import { useServerUI } from '../../context/ServerContext.jsx'

const COLUMNS = ['ID', 'Name', 'Status', 'IP Address', 'Port', 'CPU', 'Memory', 'Requests / min', 'Actions']

export default function ServersTable() {
  const { servers, removeServer } = useServers()
  const { openEditModal } = useServerUI()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return servers.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
  }, [servers, search])

  return (
    <Card
      title="Servers"
      action={
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search servers..."
            className="w-52 rounded-lg border border-app-border bg-[#0d0f1e] py-1.5 pl-7 pr-3 text-xs text-text-dim outline-none focus:border-accent1"
          />
        </div>
      }
    >
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {COLUMNS.map((h) => (
              <th
                key={h}
                className="border-b border-app-border-soft px-2 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-text-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id}>
              <td className="border-b border-white/5 px-2 py-3">{s.id}</td>
              <td className="border-b border-white/5 px-2 py-3">{s.name}</td>
              <td className="border-b border-white/5 px-2 py-3 text-status-green">● {s.status}</td>
              <td className="border-b border-white/5 px-2 py-3">{s.ip}</td>
              <td className="border-b border-white/5 px-2 py-3">{s.port}</td>
              <td className="border-b border-white/5 px-2 py-3">
                <Bar pct={s.cpu} />
              </td>
              <td className="border-b border-white/5 px-2 py-3">
                <Bar pct={s.memory} />
              </td>
              <td className="border-b border-white/5 px-2 py-3">{s.reqMin}</td>
              <td className="border-b border-white/5 px-2 py-3">
                <button
                  onClick={() => openEditModal(s.id)}
                  className="mr-1.5 rounded-md border border-app-border p-1.5 text-text-dim hover:border-accent2 hover:text-accent2"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => removeServer(s.id)}
                  className="rounded-md border border-app-border p-1.5 text-text-dim hover:border-status-red hover:text-status-red"
                >
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function Bar({ pct }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full bg-gradient-to-r from-accent1 to-accent2" style={{ width: `${pct}%` }} />
      </span>
      {pct}%
    </span>
  )
}
