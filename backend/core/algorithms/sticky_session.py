# core/algorithms/sticky_sessions.py

class StickySessions:
    """
    Routes a given session_id to the same server every time, as long as
    that server stays healthy and supports_sticky_session=True. The
    actual session->server mapping lives in LoadBalancer (see
    _sticky_map), not here - this class only decides what to do given
    the current mapping state, it doesn't own the storage.

    fallback is used to pick a server for sessions with no existing
    mapping (or whose mapped server just went unhealthy). Defaults to
    plain "first eligible server" if none is given - pass in an
    instance of another algorithm (e.g. LeastConnections()) for a
    smarter first-assignment strategy.
    """

    def __init__(self, fallback=None):
        self.fallback = fallback

    def get_server(self, servers: list, session_id: str = None, sticky_map: dict = None):
        eligible = [s for s in servers if s.supports_sticky_session]
        if not eligible:
            return None

        if session_id and sticky_map is not None:
            mapped_id = sticky_map.get(session_id)
            if mapped_id is not None:
                mapped_server = next((s for s in eligible if s.id == mapped_id), None)
                if mapped_server is not None:
                    return mapped_server
                # mapped server no longer eligible (unhealthy, or dropped
                # supports_sticky_session) - fall through and reassign

        # new session, or previous assignment no longer valid
        if self.fallback is not None:
            chosen = self.fallback.get_server(eligible)
        else:
            chosen = min(eligible, key=lambda s: s.id)  # simplest deterministic default

        if chosen is not None and session_id and sticky_map is not None:
            sticky_map[session_id] = chosen.id

        return chosen