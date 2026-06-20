from core.algorithms.round_robin import RoundRobin

class LoadBalancer:
    def __init__(self):
        self.servers = []
        self.algorithm = RoundRobin()
        
    def add_server(self, server):
        self.servers.append(server)

    def get_next_server(self):
        healthy_servers = [
            s for s in self.servers if s.healthy
        ]

        return self.algorithm.get_server(
            healthy_servers
        )