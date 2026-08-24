import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useServers } from '../hooks/useServers.js'
import { useServerUI } from '../context/ServerContext.jsx'
import ServerCard from '../components/servers/ServerCard.jsx'
import AddServerModal from '../components/servers/AddServerModal.jsx'
import EditServerModal from '../components/servers/EditServerModal.jsx'
import FilterBar from '../components/servers/FilterBar.jsx'
import Button from '../components/common/Button.jsx'
import Loader from '../components/common/Loader.jsx'
import { useAuthStore } from '../store/authStore.js'

const PAGE_SIZE = 6

export default function Servers() {
  const { servers, loading, error, fetchServers, removeServer } = useServers()
  const { openAddModal, openEditModal } = useServerUI()
  const isAdmin = useAuthStore((s) => s.isAdmin())

  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  // if a filter change shrinks the list out from under the current page,
  // fall back rather than showing a blank grid
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(servers.length / PAGE_SIZE))
    if (page > totalPages) setPage(totalPages)
  }, [servers.length, page])

  const totalPages = Math.max(1, Math.ceil(servers.length / PAGE_SIZE))
  const pagedServers = servers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold">All Servers</h1>

        {isAdmin && <Button onClick={openAddModal}>Add Server</Button>}
      </div>

      <FilterBar />

      {loading && (
        <div className="flex justify-center py-12">
          <Loader size={20} />
        </div>
      )}
      {error && <div className="text-sm text-accent">Error: {error}</div>}

      {!loading && !error && servers.length === 0 && (
        <div className="text-sm text-text-faint">No servers match the current filters.</div>
      )}

      {!loading && !error && servers.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
            {pagedServers.map((s) => (
              <ServerCard key={s.id} server={s} onEdit={openEditModal} onDelete={removeServer} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm text-text-dim">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, servers.length)} of {servers.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="px-2.5 py-1.5"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="px-1 text-text-dim">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="px-2.5 py-1.5"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AddServerModal />
      <EditServerModal />
    </div>
  )
}