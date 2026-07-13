import { api } from './axios.js'

// Maps whatever your FastAPI backend returns onto the shape the UI expects.
// I don't know your exact Pydantic field names, so this tolerates a few
// common variants (id/server_id, ip/ip_address, etc). Trim this down once
// you confirm the real response shape - or better, just rename the fields
// consistently on the backend and delete this function entirely.
function normalizeServer(raw) {

  const health = raw.health ?? {}

  return {
    id: raw.id,
    name: raw.name,
    hostname: raw.hostname ?? '',
    ip: raw.ip_address ?? '',
    port: raw.port ?? 0,

    status: raw.status ?? false,
    maintenanceMode: raw.maintenance_mode ?? false,

    weight: raw.weight ?? 1,
    priority: raw.priority ?? 0,

    maxConnections: raw.max_connections ?? null,
    cpu: raw.cpu ?? null,
    memory: raw.memory ?? null,

    region: raw.region ?? '',
    country: raw.country ?? '',
    datacenter: raw.datacenter ?? '',

    supportsStickySession: raw.supports_sticky_session ?? false,

    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',

    // runtime metrics - will be zero/null until the health-check job exists
    activeConnections: health.active_connections ?? 0,
    currentRequests: health.current_requests ?? 0,
    responseTimeMs: health.response_time_ms ?? null,
    averageLatencyMs: health.average_latency_ms ?? null,
    errorRate: health.error_rate ?? null,
    cpuUsage: health.cpu_usage ?? null,
    memoryUsage: health.memory_usage ?? null,
    networkUsage: health.network_usage ?? null,
    lastHealthCheck: health.last_health_check ?? null,

  }
}

export const serverApi = {
  list: () => api.get('/servers').then((r) => r.data.servers.map(normalizeServer)),
  get: (id) => api.get(`/servers/${id}`).then((r) => normalizeServer(r.data)),
  create: (payload) => api.post('/servers/', payload).then((r) => normalizeServer(r.data.server)),
  update: (id, patch) => api.put(`/servers/${id}`, patch).then((r) => normalizeServer(r.data.server)),
  remove: (id) => api.delete(`/servers/${id}`).then((r) => r.data),
}
