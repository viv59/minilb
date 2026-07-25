# core/algorithms/weighted_least_connections.py

class WeightedLeastConnections:
    """
    Like LeastConnections, but normalizes active_connections by weight,
    so a server with weight=2 is expected to carry ~2x the connections
    of a weight=1 server before being considered "equally loaded".

    weight <= 0 means the server is drained - excluded entirely.
    A server at or above max_connections is excluded entirely too,
    same hard-capacity gate as LeastConnections - weight decides how
    load is distributed among available servers, it doesn't override
    an explicit capacity ceiling.
    """

    def get_server(self, servers: list):
        candidates = [
            s for s in servers
            if s.weight > 0
            and (not s.max_connections or s.active_connections < s.max_connections)
        ]
        if not candidates:
            return None  # everyone's drained or at capacity

        def load_ratio(s):
            return (s.active_connections / s.weight, s.id)

        print([(s.name, s.active_connections, s.max_connections) for s in servers])  # temp debug

        return min(candidates, key=load_ratio)