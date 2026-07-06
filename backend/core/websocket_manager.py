import json

from fastapi import WebSocket


class WebSocketManager:
    """
    Tracks open WebSocket connections per simulation_id and broadcasts
    JSON events to all listeners of that simulation.

    A single shared instance is created in api/routes/simulation.py and
    imported wherever needed — this must NOT be recreated per request,
    or connections would be lost between calls.
    """

    def __init__(self):
        self.connections: dict[int, list[WebSocket]] = {}

    async def connect(self, simulation_id: int, ws: WebSocket):
        await ws.accept()
        self.connections.setdefault(simulation_id, []).append(ws)

    def disconnect(self, simulation_id: int, ws: WebSocket):
        if simulation_id in self.connections:
            if ws in self.connections[simulation_id]:
                self.connections[simulation_id].remove(ws)
            if not self.connections[simulation_id]:
                del self.connections[simulation_id]

    async def broadcast(self, simulation_id: int, message: dict):
        dead_sockets = []
        for ws in self.connections.get(simulation_id, []):
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead_sockets.append(ws)

        # clean up any connections that failed to receive
        for ws in dead_sockets:
            self.disconnect(simulation_id, ws)