import { Server as ServerIcon } from 'lucide-react'

export default function ServerNode({ server, index, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(server.id)}
      className={`absolute flex w-[230px] cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 transition ${
        selected ? 'border-status-green bg-[#0f2a22]' : 'border-[#1f5c4a80] bg-[#0f2a2280] hover:border-status-green'
      }`}
      style={{ left: 420, top: 60 + index * 130 }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12352a]">
        <ServerIcon size={16} />
      </div>
      <div>
        <div className="text-[13.5px] font-semibold">{server.name}</div>
        <div className="text-[11px] text-status-green">● {server.status}</div>
      </div>
      <div className="ml-auto text-right">
        <b className="block text-sm">{server.reqMin}</b>
        <span className="text-[10px] text-text-faint">req/min</span>
      </div>
    </div>
  )
}
