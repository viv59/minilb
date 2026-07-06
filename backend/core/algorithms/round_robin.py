class RoundRobin:

    # def __init__(self):
    #     self.current = -1

    # def select_server(self, servers):

    #     if not servers:
    #         return None
        
    #     self.current = (self.current + 1) % len(servers)

    #     return servers[self.current]

    def __init__(self):
        self.index = 0

    def get_server(self, servers: list):
        if not servers:
            return None
        
        server = servers[self.index % len(servers)]
        self.index += 1
        return server
