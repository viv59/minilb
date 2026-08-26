import { create } from 'zustand'
import { serverApi } from '../api/serverApi.js'
// import { ALGORITHMS } from '../utils/algorithms.js'
import { useToastStore } from './ToastStore.js'

// One empty condition row, used as the default/starting state of the
// filter builder and whenever a new row is added.
const emptyCondition = () => ({ field: '', operator: '', value: '' })

export const useServerStore = create((set, get) => ({
  servers: [],
  loading: false,
  error: null,
  algorithmIndex: 0,

  // --- filtering state ---
  filterFields: {},        // { fieldName: { type, operators: [] } } - fetched once
  filterFieldsLoading: false,
  conditions: [emptyCondition()],
  filterActive: false,     // true once the user has applied a filter (vs the unfiltered list)

  fetchServers: async () => {
    set({ loading: true, error: null })
    try {
      const servers = await serverApi.list()
      set({ servers, loading: false, filterActive: false })
    } catch (err) {
      set({ error: err.message ?? 'Failed to load servers', loading: false })
    }
  },

  addServer: async (payload) => {
    const server = await serverApi.create(payload)
    set((state) => ({ servers: [...state.servers, server] }))
    useToastStore.getState().showToast({
            variant: "success",
            // title: "Simulation Created",
            message: `${server.name} created successfully.`,
        });
    return server
  },

  updateServer: async (id, patch) => {
    const server = await serverApi.update(id, patch)

    set((state) => ({
      servers: state.servers.map((s) => (s.id === id ? server : s)),
    }))
    useToastStore.getState().showToast({
            variant: "success",
            // title: "Simulation Created",
            message: `${server.name} updated successfully.`,
        });
    return server
  },

  removeServer: async (id) => {
    if (get().servers.length <= 1) return
    await serverApi.remove(id)
    set((state) => ({ servers: state.servers.filter((s) => s.id !== id) }))
    useToastStore.getState().showToast({
            variant: "warning",
            // title: "Simulation Created",
            message: `${server.name} deleted successfully.`,
        });
  },

  // cycleAlgorithm: () =>
  //   set((state) => ({
  //     algorithmIndex: (state.algorithmIndex + 1) % ALGORITHMS.length,
  //   })),

  // setAlgorithmIndex: (index) => set({ algorithmIndex: index }),

  // --- filtering actions ---

  fetchFilterFields: async () => {
    if (Object.keys(get().filterFields).length > 0) return // already loaded
    set({ filterFieldsLoading: true })
    try {
      const filterFields = await serverApi.filterFields()
      set({ filterFields, filterFieldsLoading: false })
    } catch (err) {
      set({ error: err.message ?? 'Failed to load filter fields', filterFieldsLoading: false })
    }
  },

  setConditions: (conditions) => set({ conditions }),

  addCondition: () =>
    set((state) => ({ conditions: [...state.conditions, emptyCondition()] })),

  updateCondition: (index, patch) =>
    set((state) => ({
      conditions: state.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    })),

  removeCondition: (index) =>
    set((state) => ({
      conditions: state.conditions.filter((_, i) => i !== index),
    })),

  // Sends only fully-filled-in conditions (field + operator set). `is_null`
  // doesn't need a value, everything else does.
  applyFilters: async () => {
    const valid = get().conditions.filter(
      (c) => c.field && c.operator && (c.operator === 'is_null' || c.value !== '')
    )
    if (valid.length === 0) return

    set({ loading: true, error: null })
    try {
      const payload = {
        logic: 'AND',
        conditions: valid.map((c) => ({
          field: c.field,
          operator: c.operator,
          value: c.operator === 'is_null' ? true : coerceValue(c),
        })),
      }
      const servers = await serverApi.filter(payload)
      set({ servers, loading: false, filterActive: true })
    } catch (err) {
      set({ error: err.response?.data?.detail ?? err.message ?? 'Filter failed', loading: false })
    }
  },

  clearFilters: () => {
    set({ conditions: [emptyCondition()] })
    get().fetchServers()
  },
}))

// Coerces string form values to the right JS type per operator/field type
// before sending to the backend (numbers, booleans, in/not_in lists,
// between pairs).
function coerceValue(condition) {
  const { operator, value, fieldType } = condition

  if (operator === 'in' || operator === 'not_in') {
    return String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => (fieldType === 'number' ? Number(v) : v))
  }

  if (operator === 'between') {
    const [low, high] = String(value).split(',').map((v) => v.trim())
    return fieldType === 'number' ? [Number(low), Number(high)] : [low, high]
  }

  if (fieldType === 'number') return Number(value)
  if (fieldType === 'boolean') return value === true || value === 'true'

  return value
}