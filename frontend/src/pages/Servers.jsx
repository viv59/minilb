import { useEffect } from 'react'
import { useServers } from '../hooks/useServers.js'
import { useServerUI } from '../context/ServerContext.jsx'
import ServerCard from '../components/servers/ServerCard.jsx'
import AddServerModal from '../components/servers/AddServerModal.jsx'
import EditServerModal from '../components/servers/EditServerModal.jsx'

export default function Servers() {
  const { servers, loading, error, fetchServers, removeServer } = useServers()
  const { openEditModal } = useServerUI()

  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  if (loading) return <div>Loading servers...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">All Servers</h1>
      <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
        {servers.map((s) => (
          <ServerCard key={s.id} server={s} onEdit={openEditModal} onDelete={removeServer} />
        ))}
      </div>
      <AddServerModal />
      <EditServerModal />
    </div>
  )
}