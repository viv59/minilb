import asyncio
import itertools
import time

from core.load_balancer import LoadBalancer, RuntimeServer
from core.websocket_manager import WebSocketManager


class SimulationEngine:
    """
    Runs one simulation's full lifecycle in memory:
      - processes each traffic wave in order
      - for every simulated request, asks the LoadBalancer who's next
      - broadcasts a WebSocket event per request and per completed wave
      - on completion (or cancellation), persists a summary back to the DB

    One instance = one simulation run. Created fresh in the /start route
    handler and discarded after the run finishes.
    """

    def __init__(
        self,
        simulation_id: int,
        servers: list[RuntimeServer],
        waves: list[dict],
        ws_manager: WebSocketManager,
        db_session_factory,
    ):
        self.simulation_id = simulation_id
        self.servers = servers
        self.waves = waves
        self.ws_manager = ws_manager
        self.db_session_factory = db_session_factory

        self.lb = LoadBalancer()
        self.lb.set_servers(servers)

        self.request_counter = itertools.count(1)
        self.distribution = {s.name: 0 for s in servers}
        self.total_processed = 0
        self.total_requests = sum(w["requests"] for w in waves)
        self._cancelled = False

    def cancel(self):
        """Called from the /stop endpoint. Checked between requests, not mid-request."""
        self._cancelled = True

    async def run(self):
        start_time = time.time()

        for wave in self.waves:
            if self._cancelled:
                break

            await self._process_wave(wave)

            await self.ws_manager.broadcast(self.simulation_id, {
                "event": "wave_completed",
                "wave": wave["wave"],
                "total_processed": self.total_processed,
                "total_requests": self.total_requests,
            })

        elapsed = time.time() - start_time
        status = "STOPPED" if self._cancelled else "COMPLETED"

        summary = {
            "distribution": self.distribution,
            "total_requests": self.total_processed,
            "simulation_time_sec": round(elapsed, 2),
            "throughput_rps": round(self.total_processed / elapsed, 2) if elapsed > 0 else 0,
        }

        self._persist_final(status, summary)

        await self.ws_manager.broadcast(self.simulation_id, {
            "event": "simulation_completed",
            "status": status,
            "summary": summary,
        })

    async def _process_wave(self, wave: dict):
        for _ in range(wave["requests"]):
            if self._cancelled:
                return

            server = self.lb.get_next_server()
            request_id = next(self.request_counter)
            self.total_processed += 1

            if server:
                self.distribution[server.name] += 1

            await self.ws_manager.broadcast(self.simulation_id, {
                "event": "request_routed",
                "request_id": request_id,
                "server_name": server.name if server else None,
                "wave": wave["wave"],
                "distribution": self.distribution,
                "total_processed": self.total_processed,
            })

            await asyncio.sleep(wave["interval_ms"] / 1000)

    def _persist_final(self, status: str, summary: dict):
        db = self.db_session_factory()
        try:
            from models.db_model import Simulation
            sim = db.query(Simulation).get(self.simulation_id)
            if sim:
                sim.status = status
                sim.result_summary = summary
                db.commit()
        finally:
            db.close()