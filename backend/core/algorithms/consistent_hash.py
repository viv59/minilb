# core/algorithms/consistent_hash.py

import bisect
import hashlib


class ConsistentHash:
    """
    Maps clients to servers using a hash ring with virtual nodes, so that
    adding or removing a server only reshuffles the clients that were
    mapped to arcs near that server - not the entire client population,
    unlike naive hash % len(servers).

    The ring is rebuilt fresh from the current healthy server list on
    every call. This is intentionally stateless - simpler and correct,
    at the cost of rebuilding the ring each time (cheap: O(n * vnodes)
    with n = number of healthy servers, typically small).

    virtual_nodes controls how many points each server occupies on the
    ring. Higher = more even distribution, more rebuild cost. 100-150 is
    a common default for small server counts.
    """

    def __init__(self, virtual_nodes: int = 150):
        self.virtual_nodes = virtual_nodes

    def _hash(self, key: str) -> int:
        digest = hashlib.md5(key.encode()).hexdigest()
        return int(digest, 16)

    def _build_ring(self, servers: list):
        ring = {}          # hash_point -> server
        sorted_points = []  # kept sorted for bisect

        for server in servers:
            # use id, not name - names can collide/change more easily
            base_key = str(server.id)
            for i in range(self.virtual_nodes):
                point = self._hash(f"{base_key}:{i}")
                ring[point] = server
                sorted_points.append(point)

        sorted_points.sort()
        return ring, sorted_points

    def get_server(self, servers: list, client_ip: str = None):
        if not servers:
            return None

        if not client_ip:
            # no client identity to hash on - same reasoning as IPHash:
            # silently picking servers[0] would look like a bug
            return None

        ring, sorted_points = self._build_ring(servers)
        client_point = self._hash(client_ip)

        # find the first server point clockwise from the client's point
        idx = bisect.bisect(sorted_points, client_point)
        if idx == len(sorted_points):
            idx = 0  # wrap around the ring back to the start

        return ring[sorted_points[idx]]