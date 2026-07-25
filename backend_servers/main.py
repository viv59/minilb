# mock_backend/main.py
import asyncio
import random
import os
import time
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Configured per-instance via environment variables, so each port can
# behave differently - e.g. server A is fast and reliable, server B is
# slow, server C occasionally errors.
SERVER_NAME = os.getenv("SERVER_NAME", "mock-server")
MIN_DELAY_MS = int(os.getenv("MIN_DELAY_MS", "50"))
MAX_DELAY_MS = int(os.getenv("MAX_DELAY_MS", "300"))
ERROR_RATE = float(os.getenv("ERROR_RATE", "0.0"))  # 0.0-1.0, chance of a 500

# in-memory counters this instance can report on /health, useful for
# eyeballing whether your LB is actually spreading load
_state = {"active": 0, "total_served": 0}


@app.get("/health")
def health():
    return {
        "server": SERVER_NAME,
        "active_connections": _state["active"],
        "total_served": _state["total_served"],
    }


@app.post("/handle")
@app.get("/handle")
async def handle():
    _state["active"] += 1
    start = time.monotonic()
    try:
        delay_ms = random.randint(MIN_DELAY_MS, MAX_DELAY_MS)
        await asyncio.sleep(delay_ms / 1000)

        if random.random() < ERROR_RATE:
            raise HTTPException(status_code=500, detail=f"{SERVER_NAME} simulated failure")


        print(SERVER_NAME,delay_ms)
        return {
            "server": SERVER_NAME,
            "handled_in_ms": delay_ms,
        }
    finally:
        _state["active"] -= 1
        _state["total_served"] += 1