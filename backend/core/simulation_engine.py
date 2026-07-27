import asyncio
import itertools
import time
import random

import httpx

from core.load_balancer import LoadBalancer, RuntimeServer
from core.websocket_manager import WebSocketManager
from core.simulation_logger import get_simulation_logger

from core.logger import logger

class SimulationEngine:

    def __init__(
        self,
        simulation_id: int,
        servers: list[RuntimeServer],
        waves: list[dict],
        ws_manager: WebSocketManager,
        db_session_factory,
        algorithm: str
    ):
        self.simulation_id = simulation_id
        self.servers = servers
        self.waves = waves
        self.ws_manager = ws_manager
        self.db_session_factory = db_session_factory
        self.sim_logger = get_simulation_logger(simulation_id)
        self.algorithm = algorithm

        self.lb = LoadBalancer(algorithm)
        self.lb.set_servers(servers)

        self.request_counter = itertools.count(1)
        self.distribution = {s.name: 0 for s in servers}
        self.total_processed = 0
        self.total_requests = sum(w["requests"] for w in waves)
        self._cancelled = False

        # background tasks for in-flight requests, so run() can wait for
        # them to actually finish before persisting the final summary
        self._pending_tasks: set[asyncio.Task] = set()
        self._http_client = httpx.AsyncClient(timeout=5.0)

        # synthetic client identities - only meaningful for ip_hash /
        # consistent_hash, but harmless to generate regardless since
        # every other algorithm's get_server() ignores client_ip entirely
        self._synthetic_ips = [f"10.0.0.{i}" for i in range(1, 21)]

        self.sim_logger.info(f"Simulation {simulation_id} initialized")
        self.sim_logger.info(f"Servers: {[s.name for s in servers]}")
        self.sim_logger.info(f"Total requests: {self.total_requests}")
        self.sim_logger.info(f"Algorithm used: {algorithm}")

    def cancel(self):
        self._cancelled = True

    async def run(self):
        start_time = time.time()
        self.sim_logger.info("Simulation run started")

        for wave in self.waves:
            if self._cancelled:
                self.sim_logger.info("Simulation cancelled by user")
                break

            self.sim_logger.info(f"Processing wave {wave['wave']} with {wave['requests']} requests and interval(ms) {wave['interval_ms']}")
            await self._process_wave(wave)

            await self.ws_manager.broadcast(self.simulation_id, {
                "event": "wave_completed",
                "wave": wave["wave"],
                "total_processed": self.total_processed,
                "total_requests": self.total_requests,
            })
            self.sim_logger.info(f"Wave {wave['wave']} completed. Total processed: {self.total_processed}")

        # let any still-in-flight requests actually finish before we
        # compute the final summary, otherwise distribution/connections
        # would be counted mid-flight rather than settled
        if self._pending_tasks:
            self.sim_logger.info(f"Waiting for {len(self._pending_tasks)} in-flight requests to finish")
            await asyncio.gather(*self._pending_tasks, return_exceptions=True)

        await self._http_client.aclose()

        elapsed = time.time() - start_time
        status = "STOPPED" if self._cancelled else "COMPLETED"

        summary = {
            "distribution": self.distribution,
            "total_requests": self.total_processed,
            "simulation_time_sec": round(elapsed, 2),
            "throughput_rps": round(self.total_processed / elapsed, 2) if elapsed > 0 else 0,
        }

        self.sim_logger.info(f"Simulation completed with status: {status}")
        self.sim_logger.info(f"Distribution: {self.distribution}")
        self.sim_logger.info(f"Summary: {summary}")

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

            client_ip = random.choice(self._synthetic_ips)
            server = self.lb.get_next_server(client_ip=client_ip)  # already increments active_connections
            request_id = next(self.request_counter)
            self.total_processed += 1

            if server:
                self.distribution[server.name] += 1

            await self.ws_manager.broadcast(self.simulation_id, {
                "event": "request_routed",
                "request_id": request_id,
                "server_id": server.id if server else None,
                "server_name": server.name if server else None,
                "wave": wave["wave"],
                "distribution": self.distribution,
                "total_processed": self.total_processed,
            })

            self.sim_logger.info(
                f"Request {request_id} from {client_ip} routed to {server.name if server else 'none'}"
            )

            if server:
                # fire the real call as a background task - this is what
                # actually holds the connection open for its true duration,
                # instead of the fixed wave interval faking it
                task = asyncio.create_task(self._fire_request(server, request_id, wave["wave"]))
                self._pending_tasks.add(task)
                task.add_done_callback(self._pending_tasks.discard)

            # interval_ms paces how often NEW requests are dispatched -
            # unrelated to how long any individual request takes to finish
            await asyncio.sleep(wave["interval_ms"] / 1000)

    async def _fire_request(self, server, request_id: int, wave: int):
        """Actually calls the backend server and waits for its response.
        Releases the connection and broadcasts completion regardless of
        success/failure/timeout - a connection must always be released."""
        start = time.time()
        try:
            resp = await self._http_client.get(f"{server.url}/handle")
            resp.raise_for_status()
            duration_ms = round((time.time() - start) * 1000)

            self.sim_logger.info(f"Request {request_id} completed by {server.name} in {duration_ms}ms")

            await self.ws_manager.broadcast(self.simulation_id, {
                "event": "request_completed",
                "request_id": request_id,
                "server_id": server.id,
                "server_name": server.name,
                "wave": wave,
                "duration_ms": duration_ms,
                "success": True,
            })
        except httpx.HTTPError as e:
            duration_ms = round((time.time() - start) * 1000)
            self.sim_logger.error(f"Request {request_id} to {server.name} failed: {e}")

            await self.ws_manager.broadcast(self.simulation_id, {
                "event": "request_completed",
                "request_id": request_id,
                "server_id": server.id,
                "server_name": server.name,
                "wave": wave,
                "duration_ms": duration_ms,
                "success": False,
                "error": str(e),
            })
        finally:
            self.lb.release_connection(server.id)

    def _persist_final(self, status: str, summary: dict):
        db = self.db_session_factory()
        try:
            from models.db_model import Simulation
            sim = db.query(Simulation).get(self.simulation_id)
            if sim:
                sim.status = status
                sim.result_summary = summary
                db.commit()
                self.sim_logger.info(f"Simulation results persisted to database with status {status}")
            else:
                self.sim_logger.error(f"Could not find simulation {self.simulation_id} in database")
        except Exception as e:
            self.sim_logger.error(f"Error persisting simulation results: {e}")
        finally:
            db.close()