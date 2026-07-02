import { useState } from 'react'
import { Globe, ZoomIn, ZoomOut, MousePointer2, Hand, Maximize } from 'lucide-react'
import InfiniteGrid from './InfiniteGrid.jsx'
import ConnectionLine from './ConnectionLine.jsx'
import LoadBalancerNode from './LoadBalancerNode.jsx'
import ServerNode from './ServerNode.jsx'
import { useServers } from '../../hooks/useServers.js'
import { useServerUI } from '../../context/ServerContext.jsx'

// Curve from the load balancer box to server node i. Kept as a pure
// function of index so the layout stays correct as servers are added/removed.
function serverPath(i) {
  const startX = 370, startY = 280
  const endX = 420, endY = 60 + i * 130 + 34
  const midX = (startX + endX) / 2
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
}

export default function NetworkDiagram() {
  const { servers } = useServers()
  const { selectedId, setSelectedId } = useServerUI()
  const [zoom, setZoom] = useState(1)

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-2xl border border-app-border-soft bg-app-panel p-6">
      <InfiniteGrid />

      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 620 560" preserveAspectRatio="none">
          <ConnectionLine d="M 140 280 C 190 280, 190 280, 235 280" />
          {servers.map((s, i) => (
            <ConnectionLine key={s.id} d={serverPath(i)} />
          ))}
        </svg>

        <div
          className="absolute flex h-24 w-24 flex-col items-center justify-center rounded-full border border-accent1/70 bg-accent1/10 text-center text-xs font-semibold shadow-[0_0_30px_-6px_#7c5cff55]"
          style={{ left: 10, top: 232 }}
        >
          <Globe size={20} className="mb-1" />
          Incoming
          <br />
          Traffic
        </div>

        <LoadBalancerNode />

        {servers.map((s, i) => (
          <ServerNode key={s.id} server={s} index={i} selected={s.id === selectedId} onSelect={setSelectedId} />
        ))}
      </div>

      <div className="absolute bottom-6 left-6 flex gap-1.5 rounded-lg border border-app-border-soft bg-app-panel p-1.5">
        <button className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-accent1 to-[#5a3fe0] text-white">
          <MousePointer2 size={15} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-text-dim hover:text-white">
          <Hand size={15} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-dim hover:text-white"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-dim hover:text-white"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-dim hover:text-white"
        >
          <Maximize size={15} />
        </button>
      </div>
    </div>
  )
}
