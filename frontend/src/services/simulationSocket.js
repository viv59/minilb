import { API_BASE_URL } from "../utils/constants";
import { useAuthStore } from "../store/authStore.js";

function wsUrl(simId, token) {
    const httpBase = API_BASE_URL.replace(/\/$/, '')
    const wsBase = httpBase.replace(/^http/, 'ws')
    const query = token ? `?token=${encodeURIComponent(token)}` : ''
    return `${wsBase}/simulations/ws/${simId}${query}`
}

export class SimulationSocket {
    constructor(simId, { onAuthError }) {
        this.simId = simId
        this.socket = null
        this.listeners = new Set()
        this.onAuthError = onAuthError
    }

    connect() {
        const token = useAuthStore.getState().token
        this.socket = new WebSocket(wsUrl(this.simId, token))

        this.socket.onmessage = (event) => {
            let data
            try {
                data = JSON.parse(event.data)
            } catch {
                return
            }
            this.listeners.forEach((cb) => cb(data))
        }

        this.socket.onerror = (err) => console.error('[simulation ws error]', err)

        this.socket.onclose = (event) => {
            // 1008 = policy violation, matches the backend's
            // WS_1008_POLICY_VIOLATION for a missing/invalid token
            if (event.code === 1008) {
                console.error('[simulation ws] rejected - not authenticated')
                this.onAuthError?.()
                useAuthStore.getState().logout()
            }
        }
    }

    disconnect() {
        this.socket?.close()
        this.socket = null
    }

    subscribe(callback) {
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }
}