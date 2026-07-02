import { useServerStore } from '../store/serverStore.js'

export function useServers() {
  const servers = useServerStore((s) => s.servers)
  const loading = useServerStore((s) => s.loading)
  const error = useServerStore((s) => s.error)
  const fetchServers = useServerStore((s) => s.fetchServers)
  const addServer = useServerStore((s) => s.addServer)
  const updateServer = useServerStore((s) => s.updateServer)
  const removeServer = useServerStore((s) => s.removeServer)
  return { servers, loading, error, fetchServers, addServer, updateServer, removeServer }
}
