export const ALGORITHMS = [
  { id: 'round-robin', name: 'Round Robin', description: 'Cycles through servers in order, one request at a time.' },
  { id: 'least-connections', name: 'Least Connections', description: 'Sends traffic to whichever server has the fewest active connections.' },
  { id: 'weighted', name: 'Weighted', description: 'Distributes traffic proportionally to a configured weight per server.' },
  { id: 'ip-hash', name: 'IP Hash', description: "Routes a client to the same server based on a hash of the client's IP." },
]

// Small demo implementation, useful for visualizing routing on the Algorithms page.
// A real implementation would live server-side, next to your actual proxy.
export function pickRoundRobin(servers, previousIndex) {
  if (servers.length === 0) return { server: null, index: -1 }
  const nextIndex = (previousIndex + 1) % servers.length
  return { server: servers[nextIndex], index: nextIndex }
}
