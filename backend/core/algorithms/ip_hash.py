# core/algorithms/ip_hash.py

import hashlib


class IPHash:
    """
    Maps a client IP to a server via hash % server_count, so the same
    client consistently lands on the same server as long as the healthy
    server list doesn't change. Servers are sorted by id before hashing
    so the same server occupies the same "slot" across calls, given an
    unchanged server set.

    LIMITATION: if the server list changes (one goes down, one is added),
    most client->server mappings shift, since len(servers) changes the
    modulo. This is the exact problem Consistent Hashing solves - treat
    that as the fix for this weakness when you implement it, not a
    separate unrelated algorithm.
    """

    def get_server(self, servers: list, client_ip: str = None):
        if not servers:
            return None

        if not client_ip:
            # no client identity to hash - can't do IP-based affinity at all.
            # Falling back silently to servers[0] would look like a bug
            # (everyone landing on one server); surface it as None instead
            # so the caller notices and decides how to handle it.
            return None

        sorted_servers = sorted(servers, key=lambda s: s.id)
        digest = hashlib.md5(client_ip.encode()).hexdigest()
        index = int(digest, 16) % len(sorted_servers)
        return sorted_servers[index]