import { create } from 'zustand'
import { serverApi } from '../api/serverApi.js'
import { ALGORITHMS } from '../utils/algorithms.js'

export const useServerStore = create((set, get) => ({
  servers: [],
  loading: false,
  error: null,
  algorithmIndex: 0,

  fetchServers: async () => {
    set({ loading: true, error: null })
    try {
      const servers = await serverApi.list()
      set({ servers, loading: false })
    } catch (err) {
      set({ error: err.message ?? 'Failed to load servers', loading: false })
    }
  },

  addServer: async (payload) => {
    const server = await serverApi.create(payload)
    set((state) => ({ servers: [...state.servers, server] }))
    return server
  },

  updateServer: async (id, patch) => {
    const server = await serverApi.update(id, patch)

    set((state) => ({
      servers: state.servers.map((s) => (s.id === id ? server : s)),
    }))
    return server
  },

  removeServer: async (id) => {
    if (get().servers.length <= 1) return
    await serverApi.remove(id)
    set((state) => ({ servers: state.servers.filter((s) => s.id !== id) }))
  },

  cycleAlgorithm: () =>
    set((state) => ({
      algorithmIndex: (state.algorithmIndex + 1) % ALGORITHMS.length,
    })),

  setAlgorithmIndex: (index) => set({ algorithmIndex: index }),
}))
