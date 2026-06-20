class RoundRobin:

    def __init__(self):
        self.index = 0

    def get_server(self, servers):
        if not servers:
            return None

        server = servers[self.index]

        self.index = (self.index + 1) % len(servers)

        return server