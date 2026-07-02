import LiveTrafficCard from '../components/dashboard/LiveTrafficCard.jsx'
import ServerStats from '../components/dashboard/ServerStats.jsx'
import TrafficDonut from '../components/dashboard/TrafficDonut.jsx'
import NetworkDiagram from '../components/network/NetworkDiagram.jsx'
import ServerDetailPanel from '../components/servers/ServerDetailPanel.jsx'
import ServersTable from '../components/servers/ServersTable.jsx'
import AddServerModal from '../components/servers/AddServerModal.jsx'
import EditServerModal from '../components/servers/EditServerModal.jsx'
import Loader from '../components/common/Loader.jsx'
import { useServers } from '../hooks/useServers.js'

export default function Dashboard() {
  const { loading, error, servers, fetchServers } = useServers()

  if (loading && servers.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-text-dim">
        <Loader size={28} />
        <span className="text-sm">Loading servers from backend…</span>
      </div>
    )
  }

  if (error && servers.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-status-red">
        <span className="text-sm">Couldn't reach the backend: {error}</span>
        <button onClick={fetchServers} className="text-xs text-accent2 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[280px_1fr_320px] gap-5 max-[1200px]:grid-cols-1">
      <div className="flex flex-col gap-5">
        <LiveTrafficCard />
        <ServerStats />
      </div>

      <NetworkDiagram />

      <div className="flex flex-col gap-5">
        <ServerDetailPanel />
        <TrafficDonut />
      </div>

      <div className="col-span-2 max-[1200px]:col-span-1">
        <ServersTable />
      </div>

      <AddServerModal />
      <EditServerModal />
    </div>
  )
}
