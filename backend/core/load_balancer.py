from core.algorithms.consistent_hash import ConsistentHash
from core.algorithms.ip_hash import IPHash
from core.algorithms.round_robin import RoundRobin
from core.algorithms.weighted_round_robin import WeightedRoundRobin
from core.algorithms.least_connections import LeastConnections
from core.algorithms.weighted_least_connections import WeightedLeastConnections
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
    }

    def __init__(self, algorithm: str = "round_robin"):
        self.servers: list[RuntimeServer] = []
        self.set_algorithm(algorithm)
        # in-memory, per-server-id live connection counts. Cleared on
        # process restart - DB snapshot fills the gap until the LB has
        # routed to a server at least once since startup.
        self._connection_counts: dict[int, int] = {}

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

    def get_next_server(self, client_ip: str = None):
        healthy_servers = [s for s in self.servers if s.healthy]
        if not healthy_servers:
            return None

        # sync live counts onto the runtime objects before the algorithm
        # reads them - without this, LeastConnections always sees stale data
        for s in healthy_servers:
            if s.id in self._connection_counts:
                s.active_connections = self._connection_counts[s.id]

        if "client_ip" in inspect.signature(self.algorithm.get_server).parameters:
            server = self.algorithm.get_server(healthy_servers, client_ip=client_ip)
        else:
            server = self.algorithm.get_server(healthy_servers)

        if server is not None:
            self._connection_counts[server.id] = self._connection_counts.get(server.id, 0) + 1
            server.active_connections = self._connection_counts[server.id]  # keep it in sync immediately too
        return server


    def release_connection(self, server_id: int):
        if server_id in self._connection_counts and self._connection_counts[server_id] > 0:
            self._connection_counts[server_id] -= 1
            # also sync onto whichever RuntimeServer object currently
            # represents this id, if it's still in self.servers
            for s in self.servers:
                if s.id == server_id:
                    s.active_connections = self._connection_counts[server_id]
                    break