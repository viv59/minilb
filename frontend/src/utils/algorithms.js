export const ALGORITHMS = [
  { id: 'round-robin', name: 'Round Robin', description: 'Cycles through servers in order, one request at a time.' },
  { id: 'least-connections', name: 'Least Connections', description: 'Sends traffic to whichever server has the fewest active connections.' },
  { id: 'weighted', name: 'Weighted', description: 'Distributes traffic proportionally to a configured weight per server.' },
  { id: 'ip-hash', name: 'IP Hash', description: "Routes a client to the same server based on a hash of the client's IP." },
]

export const ALGORITHM_OPTIONS = [
    {
        value: "round_robin",
        label: "Round Robin",
        short_form: "RR",
        description: "Distributes requests sequentially across servers in a rotating order."
    },
    {
        value: "least_connections",
        label: "Least Connections",
        short_form: "LC",
        description: "Routes each request to the server with the fewest active connections."
    },
    {
        value: "weighted_least_connections",
        label: "Weighted Least Connections",
        short_form: "WLC",
        description: "Routes requests based on active connections relative to each server's assigned capacity weight."
    },
    {
        value: "weighted_round_robin",
        label: "Weighted Round Robin",
        short_form: "WRR",
        description: "Distributes requests proportionally according to each server's assigned weight."
    },
    {
        value: "ip_hash",
        label: "IP Hash",
        short_form: "IH",
        description: "Uses the client's IP address to consistently route requests to the same server."
    },
    {
        value: "consistent_hash",
        label: "Consistent Hash",
        short_form: "CH",
        description: "Uses consistent hashing to maintain stable server mapping while minimizing reassignment when servers change."
    },
    {
        value: "sticky_session",
        label: "Sticky Session",
        short_form: "SS",
        description: "Keeps a client connected to the same server throughout its session."
    },
    {
        value: "least_response_time",
        label: "Least Response Time",
        short_form: "LRT",
        description: "Routes requests to the server currently providing the fastest response time."
    },
    {
        value: "least_cpu_usage",
        label: "Least CPU Usage",
        short_form: "LCU",
        description: "Routes requests to the server with the lowest current CPU utilization."
    },
    {
        value: "least_memory_usage",
        label: "Least Memory Usage",
        short_form: "LMU",
        description: "Routes requests to the server with the lowest current memory utilization."
    },
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
