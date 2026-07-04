# minilb (backend)

This README describes the important backend logic, API surface, data structures and how to run the service for the minilb project (custom load balancer).

## Overview

- FastAPI application that manages backend servers and provides the basic building blocks for a simple load balancer.
- Uses SQLAlchemy for persistence. Tables are created automatically at startup (`Base.metadata.create_all`).
- Load balancing logic is implemented in `core/load_balancer.py` and pluggable algorithms live under `core/algorithms/` (currently Round Robin).

## Key directories & files

- `main.py` — FastAPI app bootstrap, router registration and CORS config.
- `api/routes/server.py` — REST endpoints for creating, listing, updating and deleting servers.
- `core/load_balancer.py` — load balancer class that selects next server using configured algorithm.
- `core/algorithms/round_robin.py` — example algorithm implementation.
- `database/database.py` — SQLAlchemy engine, session, and `get_db` dependency.
- `models/db_model.py` — ORM model definitions (Server, User).
- `models/schema.py` — Pydantic request/response schemas used by API routes.
- `core/logger.py` — application logger; logs written to `logs/`.

## Environment

Required environment variables (example):

- `DATABASE_URL` — SQLAlchemy database URL (e.g. `sqlite:///./dev.db` for local development).

Install dependencies in a virtualenv or use `venv` in `lbenv/` provided in this repo.

```
python -m venv .venv
source .venv/bin/activate   # (or .venv\Scripts\activate on Windows)
pip install -r requirements.txt
```

## Run (development)

Start the server with Uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The app will create DB tables automatically at startup.

## API Endpoints

Base prefix: none (server router is mounted at `/servers` prefix in `main.py`).

- POST /servers/
    - Purpose: create a new server record
    - Request body (JSON):
        ```json
        {
            "name": "backend-1",
            "cpu": 2,
            "memory": 2048,
            "weight": 1
        }
        ```
    - Response: created `Server` object and message.

- GET /servers/
    - Purpose: list servers
    - Response: `{ count: number, servers: [ ... ] }` or a message when no servers exist.

- PUT /servers/{server_id}
    - Purpose: update server fields
    - Request body: partial `ServerUpdate` fields (any of `name`, `cpu`, `memory`, `weight`, `status`)
    - Response: updated server object and message.

- DELETE /servers/{server_id}
    - Purpose: delete a server record

Notes about API implementation:

- `create_server` currently sets `url` to `http://localhost:8000` and `status` to boolean `True` by default — update as needed.
- Responses are simple JSON objects and use SQLAlchemy models directly; you can adapt to Pydantic response models if stricter typing/serialization is required.

## Data model (Server)

SQLAlchemy model: `models/db_model.py`

- `id` (Integer, PK)
- `name` (String, required)
- `url` (String, required)
- `status` (Boolean) — represents server health/availability (True = healthy)
- `weight` (Integer) — weight for weighted algorithms (default 1)
- `cpu` (Integer)
- `memory` (Integer)

Pydantic schemas: `models/schema.py`

- `ServerCreate` — `name`, `cpu`, `memory`, `weight`
- `ServerUpdate` — optional fields to patch existing server

Note: The front-end may expect `status` as text for display; backend stores it as boolean. Keep serialization consistent when returning to the frontend.

## Load Balancer Logic

- `core/load_balancer.py` maintains an in-memory `servers` list and delegates selection to an algorithm instance (`core/algorithms/round_robin.py`).
- Current selection logic:
    1.  Filter `self.servers` to `healthy_servers = [s for s in self.servers if s.healthy]`.
    2.  Call algorithm `get_server(healthy_servers)` which returns the next server.

Notes and caveats:

- The `Server` objects used by the LB are expected to have a `.healthy` attribute — ensure your model or wrapper exposes this boolean. The DB model uses `status` (Boolean) — consider mapping `status` -> `healthy` when building runtime server objects.
- Weight-based algorithms are not implemented in `LoadBalancer` yet — `weight` is stored on the model for future use.
- Consider adding periodic health checks that update server `status` in DB and/or runtime `healthy` flags.

## Extending / Adding Algorithms

- Add new algorithm under `core/algorithms/` with an interface method `get_server(list_of_servers)` and then instantiate it in `LoadBalancer.__init__`.
- Example: implement weighted round-robin, least-connections, or health-aware routing.

## Logs

- Application logs are written to `logs/app.log` and errors to `logs/error.log` (configured in `core/logger.py`).

## Notes & TODOs

- Normalize `status` vs `healthy` naming between DB model and runtime objects.
- Add health-checking background worker to populate server health and metrics.
- Improve API responses to use Pydantic response models instead of raw SQLAlchemy models.
- Make `url` configurable on server creation instead of hard-coding `http://localhost:8000`.

## Quick curl examples

Create server:

```bash
curl -X POST http://localhost:8000/servers/ \
	-H "Content-Type: application/json" \
	-d '{"name":"backend-1","cpu":2,"memory":1024,"weight":1}'
```

List servers:

```bash
curl http://localhost:8000/servers/
```
