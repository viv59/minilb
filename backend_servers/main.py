# mock_backend/main.py
import asyncio
import os
import random
import time

from fastapi import FastAPI, HTTPException

app = FastAPI()

SERVER_NAME = os.getenv("SERVER_NAME", "mock-server")

# baseline latency profile - most requests cluster near this, with a
# long tail toward slower outliers (log-normal-ish, closer to real
# world latency distributions than a flat uniform random range)
BASE_LATENCY_MS = float(os.getenv("BASE_LATENCY_MS", "500"))   # ~0.5s typical
JITTER_MS = float(os.getenv("JITTER_MS", "150"))               # spread around baseline
TAIL_CHANCE = float(os.getenv("TAIL_CHANCE", "0.08"))          # chance of a slow outlier
TAIL_MULTIPLIER = float(os.getenv("TAIL_MULTIPLIER", "3.0"))   # how much slower a tail request is

ERROR_RATE = float(os.getenv("ERROR_RATE", "0.0"))

# real servers slow down under concurrent load rather than staying
# constant - each additional in-flight request adds this much delay,
# simulating contention for CPU/DB connections/etc.
LOAD_SENSITIVITY_MS = float(os.getenv("LOAD_SENSITIVITY_MS", "20"))

CPU_BASELINE_OFFSET = float(os.getenv("CPU_BASELINE_OFFSET", "0"))

_state = {"active": 0, "total_served": 0, "total_errors": 0}


@app.get("/health")
def health():
    return {
        "server": SERVER_NAME,
        "active_connections": _state["active"],
        "total_served": _state["total_served"],
        "total_errors": _state["total_errors"],
        # faked resource metrics - real implementation would read actual
        # process/host stats (psutil, cgroup limits, etc). Nudges upward
        # with current load, so it's not just static noise.
        # "cpu_usage": round(min(95, 15 + _state["active"] * 4 + random.uniform(-5, 5)), 1),
        "cpu_usage": round(min(95, 15 + CPU_BASELINE_OFFSET + _state["active"] * 4 + random.uniform(-5, 5)), 1),
        "memory_usage": round(min(95, 25 + _state["active"] * 2 + random.uniform(-3, 3)), 1),
        "network_usage": round(_state["active"] * random.uniform(0.8, 1.5), 2),  # Mbps, made up
    }


def compute_delay_ms() -> float:
    # baseline + gaussian jitter, floor at something sane so it's never
    # negative or unrealistically instant
    delay = random.gauss(BASE_LATENCY_MS, JITTER_MS)
    delay = max(delay, BASE_LATENCY_MS * 0.3)

    # occasional slow outlier - simulates GC pause, slow DB query,
    # cold cache, etc. Real systems have this long tail; uniform
    # random between min/max never produces it.
    if random.random() < TAIL_CHANCE:
        delay *= TAIL_MULTIPLIER

    # current load makes this request slower too - a server already
    # handling N concurrent requests takes longer to serve the (N+1)th
    delay += _state["active"] * LOAD_SENSITIVITY_MS

    return delay


@app.post("/handle")
@app.get("/handle")
async def handle():
    _state["active"] += 1
    start = time.monotonic()
    try:
        delay_ms = compute_delay_ms()
        await asyncio.sleep(delay_ms / 1000)

        if random.random() < ERROR_RATE:
            raise HTTPException(status_code=500, detail=f"{SERVER_NAME} simulated failure")

        actual_ms = round((time.monotonic() - start) * 1000)
        print(f"{SERVER_NAME} handled in {actual_ms}ms (active={_state['active']})")

        return {
            "server": SERVER_NAME,
            "handled_in_ms": actual_ms,
            "active_connections_at_time": _state["active"],
        }
    finally:
        _state["active"] -= 1
        _state["total_served"] += 1