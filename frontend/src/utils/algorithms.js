export const ALGORITHMS = [
  { id: 'round-robin', name: 'Round Robin', description: 'Cycles through servers in order, one request at a time.' },
  { id: 'least-connections', name: 'Least Connections', description: 'Sends traffic to whichever server has the fewest active connections.' },
  { id: 'weighted', name: 'Weighted', description: 'Distributes traffic proportionally to a configured weight per server.' },
  { id: 'ip-hash', name: 'IP Hash', description: "Routes a client to the same server based on a hash of the client's IP." },
]

export const ALGORITHM_OPTIONS = [
    { value: "round_robin", label: "Round Robin", short_form: "RR" },
    { value: "least_connections", label: "Least Connections", short_form: "LC" },
    { value: "weighted_least_connections", label: "Weighted Least Connections", short_form: "WLC" },
    { value: "weighted_round_robin", label: "Weighted Round Robin", short_form: "WRR" },
    { value: "ip_hash", label: "IP Hash", short_form: "IH"},
    { value: "consistent_hash", label: "Consistent Hash", short_form: "CH" },
    { value: "sticky_session", label: "Sticky Session", short_form: "SS" },
    { value: "least_response_time", label: "Least Response Time", short_form: "LRT" },
];

// Small demo implementation, useful for visualizing routing on the Algorithms page.
// A real implementation would live server-side, next to your actual proxy.
export function pickRoundRobin(servers, previousIndex) {
  if (servers.length === 0) return { server: null, index: -1 }
  const nextIndex = (previousIndex + 1) % servers.length
  return { server: servers[nextIndex], index: nextIndex }
}

export function getServerColor(name) {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }

    // Spread hues uniformly around the color wheel
    const hue = (Math.abs(hash) * 137.508) % 360;

    return `hsl(${hue}, 68%, 56%)`;
}
