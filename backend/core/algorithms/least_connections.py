# core/algorithms/least_connections.py

class LeastConnections:
    """
    Routes to whichever healthy server currently has the fewest active
    connections. Relies on RuntimeServer.active_connections being kept
    live by LoadBalancer (see get_next_server/release_connection) -
    this class itself does no tracking, it only reads.

    Ties broken by server id, so selection is deterministic rather than
    depending on list ordering.
    """

    # def get_server(self, servers: list):
    #     if not servers:
    #         return None

    #     selected_server = min(
    #         servers,
    #         key=lambda s: (s.active_connections, s.id)
    #     )

    #     print(f"Selected Server: {selected_server.name} | Active Connections: {selected_server.active_connections}")

    #     return selected_server

    def get_server(self, servers: list):
        candidates = [
            s for s in servers
            if not s.max_connections or s.active_connections < s.max_connections
        ]
        # print([(s.name, s.active_connections, s.max_connections) for s in servers])  # temp debug
        if not candidates:
            return None
        return min(candidates, key=lambda s: (s.active_connections, s.id))