class LeastResponseTime:
    """
    Routes to whichever healthy server has the lowest average response
    time. Servers with no data yet are treated preferentially (so new
    servers get tried), but ties among unmeasured servers are broken by
    round-robin rather than always picking the lowest id - otherwise
    every unmeasured server gets serially saturated one at a time during
    warm-up instead of the initial burst spreading across all of them.
    """

    def __init__(self):
        self._warmup_index = 0

    def get_server(self, servers: list):
        if not servers:
            return None

        unmeasured = [s for s in servers if s.response_time_ms is None]
        if unmeasured:
            # round-robin across unmeasured servers, not lowest-id-first
            server = unmeasured[self._warmup_index % len(unmeasured)]
            self._warmup_index += 1
            return server

        return min(servers, key=lambda s: (s.response_time_ms, s.id))