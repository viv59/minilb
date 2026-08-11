# core/algorithms/least_memory_usage.py

class LeastMemoryUsage:
    """
    Same as LeastCPUUsage, but compares memory_usage instead.
    """

    def get_server(self, servers: list):
        if not servers:
            return None

        def memory_key(s):
            if s.memory_usage is None:
                return (-1, s.id)
            return (s.memory_usage, s.id)

        return min(servers, key=memory_key)