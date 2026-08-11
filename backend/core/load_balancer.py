from core.algorithms.least_response_time import LeastResponseTime
from core.algorithms.consistent_hash import ConsistentHash
from core.algorithms.ip_hash import IPHash
from core.algorithms.round_robin import RoundRobin
from core.algorithms.weighted_round_robin import WeightedRoundRobin
from core.algorithms.least_connections import LeastConnections
from core.algorithms.weighted_least_connections import WeightedLeastConnections
from core.algorithms.sticky_session import StickySessions
from core.algorithms.least_cpu_usage import LeastCPUUsage
from core.algorithms.least_memory_usage import LeastMemoryUsage

import inspect

class RuntimeServer:
    """
    Flattens Server + ServerHealth into one object so algorithms don't
    need to know about the two-table split. Anything from ServerHealth
    defaults gracefully since that row may be stale or (in theory) absent.
    """

    def __init__(self, db_server):
        # --- static config, from Server ---
        self.id = db_server.id
        self.name = db_server.name
        self.hostname = db_server.hostname
        self.ip_address = db_server.ip_address
        self.port = db_server.port

        self.healthy = db_server.status and not db_server.maintenance_mode

        self.weight = db_server.weight
        self.priority = db_server.priority
        self.backup = getattr(db_server, "backup", False)

        self.max_connections = db_server.max_connections
        self.cpu_capacity = db_server.cpu
        self.memory_capacity = db_server.memory

        self.region = db_server.region
        self.country = db_server.country
        self.datacenter = db_server.datacenter
        self.supports_sticky_session = db_server.supports_sticky_session

        host = db_server.hostname or db_server.ip_address
        self.url = f"http://{host}:{db_server.port}" if host else None

        # --- dynamic runtime state, from ServerHealth ---
        health = getattr(db_server, "health", None)

        self.active_connections = health.active_connections if health else 0
        self.current_requests = health.current_requests if health else 0
        self.response_time_ms = health.response_time_ms if health else None
        self.average_latency_ms = health.average_latency_ms if health else None
        self.error_rate = health.error_rate if health else None
        self.cpu_usage = health.cpu_usage if health else None
        self.memory_usage = health.memory_usage if health else None
        self.network_usage = health.network_usage if health else None
        self.last_health_check = health.last_health_check if health else None


def build_runtime_servers(db_servers: list) -> list[RuntimeServer]:
    return [RuntimeServer(s) for s in db_servers]


class LoadBalancer:
    """
    Dumb by design: knows nothing about simulations, waves, or the UI.
    Given a list of servers, it filters to the healthy ones and asks the
    configured algorithm which one is next.
    """

    ALGORITHMS = {
        "round_robin": RoundRobin,
        "weighted_round_robin": WeightedRoundRobin,
        "least_connections": LeastConnections,
        "weighted_least_connections": WeightedLeastConnections,
        "ip_hash": IPHash,
        "consistent_hash": ConsistentHash,
        "sticky_session": lambda: StickySessions(fallback=LeastConnections()),
        "least_response_time": LeastResponseTime,
        "least_cpu_usage": LeastCPUUsage,
        "least_memory_usage": LeastMemoryUsage,
    }

    def __init__(self, algorithm: str = "round_robin"):
        self.servers: list[RuntimeServer] = []
        self.set_algorithm(algorithm)
        # in-memory, per-server-id live connection counts. Cleared on
        # process restart - DB snapshot fills the gap until the LB has
        # routed to a server at least once since startup.
        self._connection_counts: dict[int, int] = {}
        self._sticky_map: dict[str, int] = {}

        self._response_times: dict[int, float] = {}
        self._ema_alpha = 0.3 # higher = reacts faster to recent changes, lower = smoother/slower

        # per-server running totals, used to compute average_latency_ms
        # (true average, distinct from the EMA) and error_rate
        self._latency_sum: dict[int, float] = {}
        self._latency_count: dict[int, int] = {}
        self._error_count: dict[int, int] = {}
        self._request_count: dict[int, int] = {}

    def set_algorithm(self, algorithm: str):
        """Swap algorithms at runtime, e.g. from an admin endpoint."""
        algo_cls = self.ALGORITHMS.get(algorithm)
        if algo_cls is None:
            raise ValueError(
                f"Unknown algorithm '{algorithm}'. Available: {list(self.ALGORITHMS)}"
            )
        self.algorithm = algo_cls()

    def set_servers(self, servers: list[RuntimeServer]):
        """Refresh the in-memory server list. Live connection counts
        override the DB-derived snapshot on each server, so routing
        decisions use the freshest number the LB actually knows about."""
        for server in servers:
            if server.id in self._connection_counts:
                server.active_connections = self._connection_counts[server.id]
        self.servers = servers

    def get_next_server(self, client_ip: str = None, session_id: str = None):
        healthy_servers = [s for s in self.servers if s.healthy]
        if not healthy_servers:
            return None

        # sync live counts onto the runtime objects before the algorithm
        # reads them - without this, LeastConnections always sees stale data
        for s in healthy_servers:
            if s.id in self._connection_counts:
                s.active_connections = self._connection_counts[s.id]
                s.current_requests = self._connection_counts[s.id]
            if s.id in self._response_times:
                s.response_time_ms = self._response_times[s.id]

        params = inspect.signature(self.algorithm.get_server).parameters
        kwargs = {}
        if "client_ip" in params:
            kwargs["client_ip"] = client_ip
        if "session_id" in params:
            kwargs["session_id"] = session_id
            kwargs["sticky_map"] = self._sticky_map

        server = self.algorithm.get_server(healthy_servers, **kwargs)

        if server is not None:
            self._connection_counts[server.id] = self._connection_counts.get(server.id, 0) + 1
            server.active_connections = self._connection_counts[server.id]
            server.current_requests = self._connection_counts[server.id]
        return server


    def release_connection(self, server_id: int):
        if server_id in self._connection_counts and self._connection_counts[server_id] > 0:
            self._connection_counts[server_id] -= 1
            # also sync onto whichever RuntimeServer object currently
            # represents this id, if it's still in self.servers
            for s in self.servers:
                if s.id == server_id:
                    s.active_connections = self._connection_counts[server_id]
                    s.current_requests = self._connection_counts[server_id]
                    break

    def record_response_time(self, server_id: int, duration_ms: float, success: bool):
        # EMA - reacts quickly to recent performance, used for routing decisions
        prev = self._response_times.get(server_id)
        self._response_times[server_id] = (
            duration_ms if prev is None
            else self._ema_alpha * duration_ms + (1 - self._ema_alpha) * prev
        )

        # true running average - purely informational, smoother/slower to
        # change than the EMA, closer to "lifetime average" than "recent trend"
        self._latency_sum[server_id] = self._latency_sum.get(server_id, 0) + duration_ms
        self._latency_count[server_id] = self._latency_count.get(server_id, 0) + 1

        self._request_count[server_id] = self._request_count.get(server_id, 0) + 1
        if not success:
            self._error_count[server_id] = self._error_count.get(server_id, 0) + 1

        for s in self.servers:
            if s.id == server_id:
                s.response_time_ms = self._response_times[server_id]
                s.average_latency_ms = self._latency_sum[server_id] / self._latency_count[server_id]
                total = self._request_count[server_id]
                errors = self._error_count.get(server_id, 0)
                s.error_rate = errors / total if total else 0.0
                break

    def record_resource_snapshot(self, server_id: int, cpu_usage=None, memory_usage=None, network_usage=None):
        """Feed in whatever a server's /health self-reports. Anything not
        provided is left untouched rather than overwritten with None."""
        for s in self.servers:
            if s.id == server_id:
                if cpu_usage is not None:
                    s.cpu_usage = cpu_usage
                if memory_usage is not None:
                    s.memory_usage = memory_usage
                if network_usage is not None:
                    s.network_usage = network_usage
                break