import { createContext, useContext, useEffect, useState } from 'react'
import { useServers } from '../hooks/useServers.js'

const ServerUIContext = createContext(null)

export function ServerUIProvider({ children }) {
  const { servers } = useServers()
  const [selectedId, setSelectedId] = useState(null)
  const [modal, setModal] = useState(null) // null | 'add' | 'bulk-upload' | { type: 'edit', serverId }

  useEffect(() => {
    if (!selectedId && servers.length > 0) setSelectedId(servers[0].id)
  }, [servers, selectedId])

  const value = {
    selectedId,
    setSelectedId,
    modal,
    openAddModal: () => setModal('add'),
    openBulkUploadModal: () => setModal('bulk-upload'),
    openEditModal: (serverId) => setModal({ type: 'edit', serverId }),
    closeModal: () => setModal(null),
  }

  return <ServerUIContext.Provider value={value}>{children}</ServerUIContext.Provider>
}

export function useServerUI() {
  const ctx = useContext(ServerUIContext)
  if (!ctx) throw new Error('useServerUI must be used inside <ServerUIProvider>')
  return ctx
}