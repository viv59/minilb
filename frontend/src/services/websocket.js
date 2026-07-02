// Mock live-metrics socket. The rest of the app only depends on
// `connect()`, `disconnect()`, and `subscribe()`, so swapping this
// class's internals for a real `new WebSocket(url)` later won't
// require touching any component code.
class MockLoadBalancerSocket {
  constructor() {
    this.listeners = new Set()
    this.intervalId = null
  }

  connect() {
    if (this.intervalId) return
    this.intervalId = setInterval(() => {
      const event = {
        type: 'metrics',
        payload: { timestamp: Date.now() },
      }
      this.listeners.forEach((cb) => cb(event))
    }, 3000)
  }

  disconnect() {
    clearInterval(this.intervalId)
    this.intervalId = null
  }

  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
}

export const loadBalancerSocket = new MockLoadBalancerSocket()
