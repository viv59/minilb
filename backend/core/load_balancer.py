from core.algorithms.round_robin import RoundRobin
from core.algorithms.weighted_round_robin import WeightedRoundRobin


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
        self.backup = getattr(db_server, "backup", False)  # confirm this column made it into the final model

        self.max_connections = db_server.max_connections
        self.cpu_capacity = db_server.cpu
        self.memory_capacity = db_server.memory

        self.region = db_server.region
        self.country = db_server.country
        self.datacenter = db_server.datacenter
        self.supports_sticky_session = db_server.supports_sticky_session

        # url is no longer stored - derive it, since hostname/ip/port are the source of truth
        host = db_server.hostname or db_server.ip_address
        self.url = f"http://{host}:{db_server.port}" if host else None

        # --- dynamic runtime state, from ServerHealth ---
        # health may be None if the row hasn't been created yet - don't crash, just zero it out
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
        "weighted": WeightedRoundRobin,
    }

    def __init__(self, algorithm: str = "round_robin"):
        self.servers: list[RuntimeServer] = []
        self.set_algorithm(algorithm)

    def set_algorithm(self, algorithm: str):
        """Swap algorithms at runtime, e.g. from an admin endpoint."""
        algo_cls = self.ALGORITHMS.get(algorithm)
        if algo_cls is None:
            raise ValueError(
                f"Unknown algorithm '{algorithm}'. Available: {list(self.ALGORITHMS)}"
            )
        self.algorithm = algo_cls()

    def set_servers(self, servers: list[RuntimeServer]):
        """Refresh the in-memory server list (call once per run, or on demand)."""
        self.servers = servers

    def get_next_server(self):
        healthy_servers = [s for s in self.servers if s.healthy]
        if not healthy_servers:
            return None
        return self.algorithm.get_server(healthy_servers)