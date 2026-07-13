class WeightedRoundRobin:

    def __init__(self):
        self.index = 0
        self.weighted_servers = []
        self.signature = None

    def get_server(self, servers: list):
        if not servers:
            return None

        signature = tuple((s.id, s.weight) for s in servers)

        if signature != self.signature:
            self.signature = signature
            self.weighted_servers = []

            for server in servers:
                if server.weight > 0:
                    self.weighted_servers.extend([server] * server.weight)
            # servers with weight <= 0 are excluded entirely - "weight: 0" is how
            # an operator drains a server without flipping status/maintenance_mode

            self.index = 0

        if not self.weighted_servers:
            # every healthy server has weight 0 - nothing to route to
            return None

        server = self.weighted_servers[self.index % len(self.weighted_servers)]
        self.index += 1

        return server