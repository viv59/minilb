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
        category: "static",
        tags: ["Simple", "Stateless", "Equal capacity"],
        description: "Distributes requests sequentially across servers in a rotating order.",
        longDescription:
            "Cycles through servers in a fixed order, sending each new request to the next one in line regardless of current load. It's predictable and needs no runtime state beyond a pointer, which makes it cheap to run at scale. The trade-off is that it doesn't account for differences in server capacity or health — a slow or struggling server still gets its full share of traffic.",
        bestFor:
            "Servers with roughly equal capacity handling stateless requests, where simplicity and predictability matter more than adapting to real-time load.",
    },
    {
        value: "least_connections",
        label: "Least Connections",
        short_form: "LC",
        category: "dynamic",
        tags: ["Load-aware", "Dynamic", "Long-lived connections"],
        description: "Routes each request to the server with the fewest active connections.",
        longDescription:
            "Tracks how many active connections each server currently holds and sends new requests to whichever has the fewest. This adapts better than Round Robin when requests take unpredictable amounts of time to finish, since a server bogged down with long-running connections naturally receives fewer new ones.",
        bestFor:
            "Workloads with widely varying request durations — WebSockets, streaming, or long-polling — where connection count is a good proxy for real load.",
    },
    {
        value: "weighted_least_connections",
        label: "Weighted Least Connections",
        short_form: "WLC",
        category: "dynamic",
        tags: ["Load-aware", "Heterogeneous hardware", "Capacity-based"],
        description: "Routes requests based on active connections relative to each server's assigned capacity weight.",
        longDescription:
            "Extends Least Connections by weighing each server's connection count against a configured capacity weight, so a beefier server can hold proportionally more concurrent connections before being deprioritized. Useful whenever your fleet isn't made of identical machines.",
        bestFor:
            "Mixed-capacity server fleets — for example, some nodes with double the CPU or RAM — where raw connection count alone would be unfair to the stronger servers.",
    },
    {
        value: "weighted_round_robin",
        label: "Weighted Round Robin",
        short_form: "WRR",
        category: "static",
        tags: ["Simple", "Capacity-based", "Predictable"],
        description: "Distributes requests proportionally according to each server's assigned weight.",
        longDescription:
            "Behaves like Round Robin, but each server is assigned a weight and receives requests proportional to it — a server with weight 3 gets three requests for every one a weight-1 server gets. It still doesn't react to real-time load, only to the configured ratio, so it works best when relative capacity is known and stable.",
        bestFor:
            "Heterogeneous but stable server capacity, where you already know each server's relative strength ahead of time and it isn't expected to change.",
    },
    {
        value: "ip_hash",
        label: "IP Hash",
        short_form: "IH",
        category: "static",
        tags: ["Session affinity", "Deterministic", "No session store"],
        description: "Uses the client's IP address to consistently route requests to the same server.",
        longDescription:
            "Hashes the client's IP address to deterministically pick a server, so the same client always lands on the same backend as long as the server pool doesn't change. It's a simple way to get session affinity without a shared session store, but adding or removing a server reshuffles a large fraction of client-to-server mappings.",
        bestFor:
            "Cases that need session affinity without a session store, where the server pool changes rarely and clients have stable, distinct IPs.",
    },
    {
        value: "consistent_hash",
        label: "Consistent Hash",
        short_form: "CH",
        category: "static",
        tags: ["Session affinity", "Minimal disruption", "Scales well"],
        description: "Uses consistent hashing to maintain stable server mapping while minimizing reassignment when servers change.",
        longDescription:
            "Solves IP Hash's biggest weakness: it maps both servers and requests onto a hash ring, so adding or removing a server only remaps the keys immediately adjacent to it, not the entire pool. This makes it far more stable under scaling events, which is why it's common in distributed caches and sharded systems.",
        bestFor:
            "Systems that need the affinity of IP Hash but scale server count up or down frequently — autoscaling groups, caching layers, sharded storage.",
    },
    {
        value: "sticky_session",
        label: "Sticky Session",
        short_form: "SS",
        category: "static",
        tags: ["Session affinity", "Stateful apps", "Cookie/token based"],
        description: "Keeps a client connected to the same server throughout its session.",
        longDescription:
            "Pins a client to the same server for the life of its session, typically via a cookie or token rather than the client's IP. This gives more reliable affinity than IP Hash for clients behind NAT or shared proxies, which would otherwise all hash to a single server — but it ties client and server lifecycle together, which complicates failover if that server goes down.",
        bestFor:
            "Applications that keep session state in server memory rather than a shared store, and need a given client to reliably return to the same server.",
    },
    {
        value: "least_response_time",
        label: "Least Response Time",
        short_form: "LRT",
        category: "dynamic",
        tags: ["Load-aware", "Latency-optimized", "Requires monitoring"],
        description: "Routes requests to the server currently providing the fastest response time.",
        longDescription:
            "Continuously measures each server's response time alongside its connection count, and sends new requests to whichever is currently responding fastest. It reacts to real degradation more directly than connection-count-based methods, but it depends on active, timely latency monitoring to work well — stale metrics can send traffic to a server that's no longer actually fast.",
        bestFor:
            "Latency-sensitive services where you want to actively favor the fastest-responding server, not just the least busy one.",
    },
    {
        value: "least_cpu_usage",
        label: "Least CPU Usage",
        short_form: "LCU",
        category: "dynamic",
        tags: ["Resource-aware", "Dynamic", "Requires metrics"],
        description: "Routes requests to the server with the lowest current CPU utilization.",
        longDescription:
            "Routes to whichever server is currently reporting the lowest CPU utilization. Effective for compute-heavy workloads where CPU is the real bottleneck, but it depends on timely, accurate metrics reporting from every server — stale data can cause routing decisions to lag behind actual conditions.",
        bestFor:
            "CPU-bound workloads where request cost varies a lot and you want to route away from servers currently under compute pressure.",
    },
    {
        value: "least_memory_usage",
        label: "Least Memory Usage",
        short_form: "LMU",
        category: "dynamic",
        tags: ["Resource-aware", "Dynamic", "Requires metrics"],
        description: "Routes requests to the server with the lowest current memory utilization.",
        longDescription:
            "Works like Least CPU Usage but tracks memory utilization instead, favoring servers with more headroom. It suits workloads where memory pressure — not CPU or connection count — is the resource most likely to become the bottleneck.",
        bestFor:
            "Memory-bound workloads, such as in-memory caching or large per-request data processing, where memory is the limiting resource.",
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
