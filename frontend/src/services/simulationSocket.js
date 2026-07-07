import { API_BASE_URL } from "../utils/constants";

function wsUrl(simId) {
    const httpBase = API_BASE_URL.replace(/\/$/,'')
    const wsBase = httpBase.replace(/^http/,'ws')
    return `${wsBase}/simulations/ws/${simId}`
}

export class SimulationSocket {
    constructor(simId) {
        this.simId = simId
        this.socket = null
        this.listeners = new Set()
    }

    connect() {
        this.socket = new WebSocket(wsUrl(this.simId))
        this.socket.onmessage = (event) => {
            let data
            try{
                data = JSON.parse(event.data)
            } catch {
                return
            }
            this.listeners.forEach((cb) => cb(data))
        }
        this.socket.onerror = (err) => console.error('[simulation ws error]', err)
    }

    disconnect(){
        this.socket?.close()
        this.socket = null
    }

    subscribe(callback){
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }

}