# core/algorithms/least_cpu_usage.py

class LeastCPUUsage:
    """
    Routes to whichever healthy server currently reports the lowest
    cpu_usage. Relies on RuntimeServer.cpu_usage being kept live by
    LoadBalancer.record_resource_snapshot (fed from each server's own
    /health self-report) - this class only reads, it never measures
    anything itself.

    Servers with no reading yet (cpu_usage is None - /health hasn't
    been polled for them, or the poll failed) are treated as equally
    preferable to the least-loaded known server, not penalized for
    missing data. No warmup round-robin here (unlike LeastResponseTime)
    since _poll_all_servers_initial already seeds every server before
    the first routing decision - by the time this runs, "unmeasured"
    should only happen if that initial poll genuinely failed for a
    specific server.
    """

    def get_server(self, servers: list):
        if not servers:
            return None

        def cpu_key(s):
            if s.cpu_usage is None:
                return (-1, s.id)
            return (s.cpu_usage, s.id)

        return min(servers, key=cpu_key)