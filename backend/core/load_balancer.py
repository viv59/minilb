from core.algorithms.round_robin import RoundRobin
from core.algorithms.weighted_round_robin import WeightedRoundRobin
class RuntimeServer:

    def __init__(self, db_server):
        self.id = db_server.id
        self.name = db_server.name
        self.url = db_server.url
        self.weight = db_server.weight
        self.healthy = db_server.status

def build_runtime_servers(db_servers: list) -> list[RuntimeServer]:
    return [RuntimeServer(s) for s in db_servers]

# class LoadBalancer:
    
#     def __init__(self, registry):
#         self.registry = registry
#         self.algorithm = RoundRobin()

#     def route_request(self):

#         servers = self.registry.get_servers()

#         server = self.algorithm.select_server(servers)

#         return server
        

class LoadBalancer:
    """
    Dumb by design: knows nothing about simulations, waves, or the UI.
    Given a list of servers, it filters to the healthy ones and asks the
    configured algorithm which one is next.
    """

    def __init__(self, algorithm=None):
        self.servers: list[RuntimeServer] = []
        self.algorithm = algorithm or RoundRobin()
        self.algorithm = algorithm or WeightedRoundRobin()

    def set_servers(self, servers: list[RuntimeServer]):
        """Refresh the in-memory server list (call once per run, or on demand)."""
        self.servers = servers

    def get_next_server(self):
        healthy_servers = [s for s in self.servers if s.healthy]
        return self.algorithm.get_server(healthy_servers)