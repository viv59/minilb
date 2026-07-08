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
                self.weighted_servers.extend([server] * max(1, server.weight))

            self.index = 0

        server = self.weighted_servers[self.index % len(self.weighted_servers)]
        self.index += 1

        return server