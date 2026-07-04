import { api } from './axios.js'

// Maps whatever your FastAPI backend returns onto the shape the UI expects.
// I don't know your exact Pydantic field names, so this tolerates a few
// common variants (id/server_id, ip/ip_address, etc). Trim this down once
// you confirm the real response shape - or better, just rename the fields
// consistently on the backend and delete this function entirely.
function normalizeServer(raw) {

  return {
    id: raw.id ?? raw.server_id,
    name: raw.name ?? `Server ${raw.id ?? raw.server_id}`,
    status: raw.status ?? 'Healthy',
    ip: raw.ip ?? raw.ip_address ?? '',
    port: raw.port ?? 0,
    cpu: raw.cpu ?? raw.cpu_usage ?? 0,
    memory: raw.memory ?? raw.memory_usage ?? 0,
    reqMin: raw.reqMin ?? raw.req_per_min ?? raw.requests_per_minute ?? 0,
    uptime: raw.uptime ?? '',
    created: raw.created ?? raw.created_at ?? '',
    url: raw.url ?? '',
    weight: raw.weight ?? 1
  }
}

export const serverApi = {
  list: () => api.get('/servers').then((r) => r.data.servers.map(normalizeServer)),
  get: (id) => api.get(`/servers/${id}`).then((r) => normalizeServer(r.data)),
  create: (payload) => api.post('/servers/', payload).then((r) => normalizeServer(r.data.server)),
  update: (id, patch) => api.put(`/servers/${id}`, patch).then((r) => normalizeServer(r.data.server)),
  remove: (id) => api.delete(`/servers/${id}`).then((r) => r.data),
}
